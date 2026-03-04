package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.WayBillBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.invoice.CreditorInvoicePrintPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.dao.impl.bill.BillDaoImpl;
import com.iv.dao.impl.bill.BillTaxTxnDaoImpl;
import com.iv.dao.impl.waybill.LRInvoiceDetailsDaoImpl;
import com.iv.dto.bill.BillTaxTxn;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.TaxMasterConstant;
import com.iv.dto.waybill.LRInvoiceDetails;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.BankAccountDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.ContainerDetailsDAO;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillDAO;
import com.platform.dao.reports.CreditWayBillPaymentDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AccountGroup;
import com.platform.dto.BankAccount;
import com.platform.dto.BillClearance;
import com.platform.dto.BillDetailsForBillClearance;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.City;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ContainerDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.Region;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillDetailsForPrintingBill;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.ChargeTypeConstant;
import com.platform.dto.constant.DeliveryChargeConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class PrintBillDetailsAfterCreationAction implements Action {
	@Override
	@SuppressWarnings({ "unchecked"})
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			                    error 				            = null;
		CacheManip							                    cache 				            = null;
		Executive							                    executive			            = null;
		Branch								                    branch				            = null;
		VehicleType 						                    vehicleType			            = null;
		ReportViewModel 					                    reportViewModel 	            = null;
		WayBillDetailsForPrintingBill[]		                    wayBills			            = null;
		ValueObject							                    valueOutObject		            = null;
		Long[]								                    wayBillIdArray		            = null;
		Map<Long, WayBillDeatailsModel>                    	 	wayBillDetails 		            = null;
		Map<Long, CustomerDetails>		                    	consigneeDetails	            = null;
		Map<Long, CustomerDetails>		                    	consignorDetails	            = null;
		ConsignmentDetails[] 				                    consDetails 		            = null;
		String	 					                    		toPayWayBillIds		            = null;
		WayBillCharges[]					                    wayBillCharges		            = null;
		WayBillTaxTxn[]  					                    taxes   			            = null;
		Map<Long, ArrayList<WayBillIncome>>						wbIncomeCol			            = null;
		Map<Long, WayBill> 				                    	toPayWbBkgDtCol		            = null;
		Map<Long, DispatchLedger> 		                    	dispatchHM 			            = null;
		Long[]								                    bookingIdArray		            = null;
		Long[]								                    bothIdArray			            = null;
		String 								                    wayBillIdsStr 		            = null;
		Map<Long, WayBill> 				             	        wbDtls				  	        = null;
		List<Long> 					                   			bookingChargeWBIdList           = null;
		List<Long> 					                   			bothChargeWBIdList 	            = null;
		Map<Long, WayBillDeatailsModel>                     	wayBillBookingDetails           = null;
		HashMap<Long, ConsignmentSummary>   	                conSummaryHM		            = null;
		HashMap<Long, DeliveryContactDetails> 					deliveryContactDetails 			= null;
		HashMap<Long, HashMap<Object, Object>> 					deliveryContactDetailsJsonObj 	= null;
		ArrayList<WayBillCharges> 								wayBillChrgsArrList				= null;
		WayBillCharges[]									    wayBillChrgsArr					= null;
		HashMap<Long, HashMap<Short, WayBillCharges>> 		    lrWiseWayBillChargesCol 		= null;
		HashMap<Long, HashMap<Short, HashMap<Object, Object>>>  lrWiseWayBillChargesColForJSON 	= null;
		ValueObject 											valObjConSumm					= null;
		HashMap<Long, ConsignmentSummary>   					consignmentSummaryHM   			= null;
		Short 													serviceTaxPaidById 				= 0 ;
		List<WayBillDetailsForPrintingBill>  	            	finalListArrNew							= null;
		WayBillDetailsForPrintingBill[]							finalWayBills							= null;
		Branch									                handlingBranch							= null;
		ValueObject								                print									= null;
		ValueObject								                valueObject				    			= null;
		City									                city									= null;
		var													isLaserPrint							= false;
		AccountGroup											accountGroup							= null;
		CorporateAccount										corporateAccount						= null;
		var 													totalPkgQty 							= 0;
		var 													otherCharges 							= 0.00;
		var 													totalOtherCharges 						= 0.00;
		Map<Long, ArrayList<ContainerDetails>>					contDetailsCol 							= null;
		List<BankAccount>	    								bankAccountList							= null;
		BankAccount												bankAccount								= null;
		Map<Long, BillClearance>								billClearanceDetailsHm					= null;
		BillClearance											billClearance							= null;
		var													totalAdvanceAmount						= 0.00;
		ValueObject												outValObject							= null;
		String 													branchIds 								= null;
		BillDetailsForBillClearance[]							bills		 							= null;
		Long[]													billIdArray								= null;
		String													billIdStr								= null;
		Map<Long,BillClearance>									billClearanceDetails					= null;
		String													bankAccountIds							= null;
		Region													region									= null;
		Map<Long, String> 										invoicNoData 							= null;
		Map<Long, String>										invoiceDateData							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var billId = JSPUtility.GetLong(request, "billId" ,0);
			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);
			accountGroup= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());
			isLaserPrint = JSPUtility.GetBoolean(request, "isLaserPrint" , false);
			request.setAttribute("billPdfEmailAllowed", JSPUtility.GetBoolean(request, "billPdfEmailAllowed" , false));
			request.setAttribute("isSearchBillPDFEmail", JSPUtility.GetBoolean(request, "isSearchBillPDFEmail" , false));

			final var wayBillBll					= new WayBillBll();

			final var 	groupConfiguration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	invoiceConfiguration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
			final var 	printConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDITOR_INVOICE_PRINT);

			final List<Long>	lrTypeListToAllowInDecimal			= wayBillBll.lrTypeListToToAllowDecimalAmountAllow(groupConfiguration);

			final var showVehicleNumberBookingTypeWise			= (boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.DONOT_PRINT_LR_VEHICLE_NUMBER_IN_FTL_BOOKING_TYPE, false);
			final var printBookingTimeRemark					= (boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.PRINT_BOOKING_TIME_REMARK, false);
			final var branchIdsMappingWithBankAccountDetails	= (String) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.BRANCH_IDS_MAPPING_WITH_BANK_ACCOUNT_DETAILS,"0_0");
			final var appendHandlingBranchWithSourceBranch		= (boolean) invoiceConfiguration.getOrDefault(CreditorInvoicePropertiesConstant.APPEND_HANDLING_BRANCH_WITH_SOURCE_BRANCH, false);
			final var showMultipleInvoiceNo						= (boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.SHOW_MULTIPLE_INVOICE_NO, false);
			final var noOfInvoiceNoToPrint						= (int) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.NO_OF_INVOICE_NO_TO_PRINT, 0);

			final var	bill 				= BillDAO.getInstance().getBillDetailsForPrintingBill(billId);
			final List<BillTaxTxn> 				billTaxTxnDetails	= BillTaxTxnDaoImpl.getInstance().getBillTaxTxnListByBillIdForPrint(billId);
			final var transpotModeMap	= cache.getTransportationModeForGroup(request, executive.getAccountGroupId());

			if(billTaxTxnDetails != null)
				for (final BillTaxTxn billTaxTxnDetail : billTaxTxnDetails)
					if(billTaxTxnDetail.getTaxMasterId() == TaxMasterConstant.CGST_MASTER_ID) {
						request.setAttribute(TaxMasterConstant.CGST_MASTER_NAME, billTaxTxnDetail.getTaxAmount());
						request.setAttribute("CGST_PercentAmount", billTaxTxnDetail.getPercentTaxAmount());
					} else if(billTaxTxnDetail.getTaxMasterId() == TaxMasterConstant.SGST_MASTER_ID) {
						request.setAttribute(TaxMasterConstant.SGST_MASTER_NAME, billTaxTxnDetail.getTaxAmount());
						request.setAttribute("SGST_PercentAmount", billTaxTxnDetail.getPercentTaxAmount());
					} else if(billTaxTxnDetail.getTaxMasterId() == TaxMasterConstant.IGST_MASTER_ID) {
						request.setAttribute(TaxMasterConstant.IGST_MASTER_NAME, billTaxTxnDetail.getTaxAmount());
						request.setAttribute("IGST_PercentAmount", billTaxTxnDetail.getPercentTaxAmount());
					}

			if(bill != null) {
				branch = cache.getGenericBranchDetailCache(request, bill.getBranchId());
				bankAccount				= new BankAccount();
				bankAccount.setAccountGroupId(executive.getAccountGroupId());
				bankAccount.setBranchId(branch.getBranchId());
				bankAccount.setSubRegionId(branch.getSubRegionId());

				bill.setBranchName(branch.getName());
				bill.setCityName(branch.getName());
				bill.setBranchAddress(branch.getAddress());
				bill.setBranchGstn(branch.getGstn());
				bill.setBranchPanNo(branch.getPanNumber());
				bill.setBranchPhoneNumber(branch.getPhoneNumber());
				bill.setBranchMobileNumber(branch.getMobileNumber());
				bill.setBillSubRegionId(branch.getSubRegionId());
				bill.setBillRegionId(branch.getRegionId());
				bill.setCreditorGstn(Utility.checkedNullCondition(bill.getCreditorGstn(), (short)1));

				region = cache.getGenericRegionById(request, branch.getRegionId());

				if(region != null) {
					bill.setBillRegionName(region.getName());
					bill.setRegionCode(region.getRegionCode());
				}

				final var	trForGroup = transpotModeMap.get(bill.getTransportationModeId());

				bill.setTransportationModeStirng(trForGroup != null ? trForGroup.getTransportModeName() : "");

				branch = cache.getGenericBranchDetailCache(request, bill.getCreditorBranchId());

				if(branch != null) {
					city = cache.getCityById(request, branch.getCityId());
					bill.setCreditorBranchName(branch.getName());
					bill.setCreditorCityName(city.getName());
				}

				bill.setPartyName(Utility.removeLastWordFromString(bill.getPartyName(), "_"));
				bill.setRemark(Utility.checkedNullCondition(bill.getRemark(), (short) 1));

				corporateAccount = CorporateAccountDao.getInstance().findByCorporateAccountId(bill.getCreditorId());

				invoiceConfiguration.put(CreditorInvoicePrintPropertiesConstant.SHOW_HO_ADDRESS, printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.SHOW_HO_ADDRESS, false));

				bill.setPartyStateCode(Utility.getStateCodeStr(corporateAccount.getGstn()));
				bill.setPartyStateName(Utility.getStateNameByGSTCode(bill.getPartyStateCode()));
				bill.setDueDateStr(DateTimeUtility.getDateFromTimeStamp(bill.getDueDate()));

				print	= new ValueObject();

				request.setAttribute("BillDetailsForPrintingBill", bill);
				request.setAttribute("configuration", new ValueObject((HashMap<Object, Object>) invoiceConfiguration));
				request.setAttribute("corporateAccount", corporateAccount);

				if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.PRINT_BRANCH_WISE_BANK_DETAILS, false))
					bankAccountList			= BankAccountDao.getInstance().getBranchWiseBankDetailsPrint(bankAccount);
				else if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.PRINT_SUB_REGION_WISE_BANK_DETAILS, false))
					bankAccountList			= BankAccountDao.getInstance().getSubRegionWiseBankDetailsPrint(bankAccount);

				if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.PRINT_BRANCH_WISE_BANK_DETAILS_IF_SUB_REGION_WISE_NOT_FOUND, false)
						&& (bankAccountList == null || bankAccountList.isEmpty())) {
					final var 	longHashMap			= CollectionUtility.getLongWithLongHashMapFromStringArray(branchIdsMappingWithBankAccountDetails, Constant.COMMA);

					if(longHashMap.containsKey(bill.getBranchId()))
						bankAccountIds	= CollectionUtility.getStringFromLongList(longHashMap.get(bill.getBranchId()));

					if(bankAccountIds != null)
						bankAccountList			= BankAccountDao.getInstance().getBankDetailsByBankAccountIdsAndAccountGroupId(executive.getAccountGroupId(), bankAccountIds);
				}

				if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.PRINT_OUT_STANDING_AMOUNT, false)) {
					branchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
					outValObject = BillDAO.getInstance().getBillDetailsForBillClearance((short)1, bill.getCreditorId(), branchIds, executive.getAccountGroupId());

					if(outValObject!= null && !outValObject.isEmpty()) {
						billIdArray = (Long[])outValObject.get("BillIdArray");

						if(billIdArray.length > 0) {
							billIdStr = Arrays.toString(billIdArray);
							billIdStr = billIdStr.replace("[", "");
							billIdStr = billIdStr.replace("]", "");
							billClearanceDetails = BillClearanceDAO.getInstance().getBillClearanceDetails(billIdStr);
						}

						bills		= (BillDetailsForBillClearance[]) outValObject.get("BillDetailsForBillClearance");

						if(bills != null)
							for (final BillDetailsForBillClearance bill2 : bills)
								if(bill2.getStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID) {
									bill2.setGrandTotal(bill2.getGrandTotal() + bill2.getAdditionalCharge() + bill2.getIncomeAmount());
									bill2.setBalAmount(bill2.getGrandTotal());
									bill2.setCreationDateTimeStampString(DateTimeUtility.getDateFromTimeStamp(bill2.getCreationDateTimeStamp()));
								} else {
									billClearance 	= billClearanceDetails.get(bill2.getBillId());

									if(billClearance != null && billClearance.getStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CANCELLED_ID) {
										bill2.setGrandTotal(billClearance.getGrandTotal());
										bill2.setBalAmount(billClearance.getGrandTotal() - billClearance.getTotalReceivedAmount());
										bill2.setCreationDateTimeStampString(DateTimeUtility.getDateFromTimeStamp(bill2.getCreationDateTimeStamp()));
									}
								}
					}

					request.setAttribute("BillDetailsForBillClearance", bills);
				}

				valueOutObject 			  = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForPrintingBill(billId);

				if(valueOutObject != null) {
					wayBills 		   	   = (WayBillDetailsForPrintingBill[])valueOutObject.get("WayBillDetailsForPrintingBill");
					wayBillIdArray 	   	   = (Long[])valueOutObject.get("WayBillIdArray");
					bothChargeWBIdList 	   = (ArrayList<Long> )valueOutObject.get("bothChargeWBIdList");
					bookingChargeWBIdList  = (ArrayList<Long> )valueOutObject.get("bookingChargeWBIdList");

					if(wayBills != null && wayBills.length > 0) {
						wayBillIdsStr 			= CollectionUtility.getLongArrayToString(wayBillIdArray);
						contDetailsCol			= ContainerDetailsDAO.getInstance().getContainerDetailsByWayBillIds(wayBillIdsStr);
						consignorDetails 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
						consigneeDetails   	 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);
						wbIncomeCol 			= WayBillIncomeDao.getInstance().getWayBillIncomeByWayBillIdArray(wayBillIdsStr);
						wbDtls 					= WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIdsStr);
						conSummaryHM			= ConsignmentSummaryDao.getInstance().getConsignmentSummaryLRTypeFlagForBillCredit(wayBillIdsStr);
						lrWiseWayBillChargesCol = new HashMap<>();
						wayBillChrgsArrList		= new ArrayList<>();

						if(showMultipleInvoiceNo) {
							final var	invoiceDetails		= LRInvoiceDetailsDaoImpl.getInstance().getInvoiceBillDetaByWayBillIds(wayBillIdsStr);
							invoicNoData		= new HashMap<>();
							invoiceDateData		= new HashMap<>();

							if(ObjectUtils.isNotEmpty(invoiceDetails)) {
								final Map<Long, List<LRInvoiceDetails>> groupedInvoiceDetails = invoiceDetails.stream()
										.collect(Collectors.groupingBy(LRInvoiceDetails::getWayBillId));

								for (final Map.Entry<Long, List<LRInvoiceDetails>> entry : groupedInvoiceDetails.entrySet()) {
									var groupInvoiceDetails = entry.getValue();

									if (noOfInvoiceNoToPrint > 0 && groupInvoiceDetails.size() > noOfInvoiceNoToPrint)
										groupInvoiceDetails = new ArrayList<>(groupInvoiceDetails.subList(0, noOfInvoiceNoToPrint));

									final Map<Long, String> groupInvoicNoData = groupInvoiceDetails.stream()
											.collect(Collectors.groupingBy(LRInvoiceDetails::getWayBillId,
													Collectors.mapping(LRInvoiceDetails::getInvoiceNumber, Collectors.joining(Constant.COMMA))));

									final Map<Long, String> groupInvoiceDateData = groupInvoiceDetails.stream()
											.collect(Collectors.groupingBy(LRInvoiceDetails::getWayBillId,
													Collectors.mapping(LRInvoiceDetails::getInvoiceDate, Collectors.joining(Constant.COMMA))));

									invoicNoData.putAll(groupInvoicNoData);
									invoiceDateData.putAll(groupInvoiceDateData);
								}
							}
						}

						lrWiseWayBillChargesColForJSON = new HashMap<>();
						valueOutObject 			= DispatchSummaryDao.getInstance().getDispatchLedgerDetailsByWayBillIds(wayBillIdsStr);
						valObjConSumm			= ConsignmentSummaryDao.getInstance().getTaxPaidBy(wayBillIdsStr);

						if(valObjConSumm != null)
							consignmentSummaryHM = (HashMap<Long, ConsignmentSummary>)valObjConSumm.get("consignmentSummaryHM");

						deliveryContactDetails = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(wayBillIdsStr);

						if(valueOutObject != null)
							dispatchHM = (HashMap<Long, DispatchLedger>)valueOutObject.get("dispatchHM");

						//Get Way Bill details
						if(bookingChargeWBIdList != null && !bookingChargeWBIdList.isEmpty()) {
							bookingIdArray = new Long[bookingChargeWBIdList.size()];
							bookingChargeWBIdList.toArray(bookingIdArray);

							wayBillBookingDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(bookingIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
						}

						if(bothChargeWBIdList != null && !bothChargeWBIdList.isEmpty()) {
							bothIdArray = new Long[bothChargeWBIdList.size()];
							bothChargeWBIdList.toArray(bothIdArray);

							wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(bothIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOTH ,true);
						}

						if(conSummaryHM != null && conSummaryHM.size() > 0)
							toPayWayBillIds	= conSummaryHM.values().stream().filter(e -> e.isDeliveryTimeTBB() || printBookingTimeRemark)
							.map(e -> e.getWayBillId() + "").collect(Collectors.joining(","));

						if(toPayWayBillIds != null && !toPayWayBillIds.isEmpty())
							toPayWbBkgDtCol = WayBillHistoryDao.getInstance().getLimitedWayBillDetailsByStatus(toPayWayBillIds, WayBill.WAYBILL_STATUS_BOOKED);

						if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.SHOW_ADVANCE_AMOUNT_FROM_INVOICE_PAYMENT, false)
								&& wayBills.length == 1) {
							billClearanceDetailsHm = BillClearanceDAO.getInstance().getBillClearanceDetails(String.valueOf(bill.getBillId()));

							if(billClearanceDetailsHm != null && !billClearanceDetailsHm.isEmpty()
									&& com.iv.utils.utility.Utility.isIdExistInLongList(printConfiguration, CreditorInvoicePrintPropertiesConstant.SUB_REGION_IDS_TO_SHOW_ADVANCE_AMOUNT, bill.getBillSubRegionId()))
								totalAdvanceAmount	= billClearanceDetailsHm.values().stream().filter(e -> e.getBillStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
								.mapToDouble(BillClearance::getTotalReceivedAmount).sum();
						}

						request.setAttribute("totalAdvanceAmount", totalAdvanceAmount);

						for (final WayBillDetailsForPrintingBill wayBill : wayBills) {
							totalPkgQty 	= 0;
							otherCharges 	= 0.00;
							totalOtherCharges 	= 0.00;
							final var wayBillChargesCol 			= new HashMap<Short, WayBillCharges>();
							final var	wayBillChargesColForJSON 	= new HashMap<Short, HashMap<Object, Object>>();
							List<ContainerDetails> contArr			 = null;
							final var wb = wbDtls.get(wayBill.getWayBillId());
							wayBill.setWayBillTypeId((short)wb.getWayBillTypeId());

							final var	sourceBranch 				= cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
							final var	destBranch 					= cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());

							if(sourceBranch != null)
								handlingBranch	= cache.getGenericBranchDetailCache(request,sourceBranch.getHandlingBranchId());

							if(appendHandlingBranchWithSourceBranch && wayBill.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
									&& sourceBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && handlingBranch != null)
								wayBill.setSourceBranch(handlingBranch.getName() + " - " + sourceBranch.getName());
							else
								wayBill.setSourceBranch(sourceBranch.getName());

							wayBill.setDestinationBranch(destBranch.getName());
							wayBill.setSourceBranchAbrvnCode(Utility.checkedNullCondition(sourceBranch.getAbbrevationName(), (short) 1));
							wayBill.setDestinationBranchAbrvnCode(Utility.checkedNullCondition(destBranch.getAbbrevationName(), (short) 1));
							wayBill.setSourceBranchCode(Utility.checkedNullCondition(sourceBranch.getBranchCode(), (short) 1));
							wayBill.setDestinationBranchCode(Utility.checkedNullCondition(destBranch.getBranchCode(), (short) 1));
							wayBill.setSourceSubRegion(cache.getGenericSubRegionById(request, sourceBranch.getSubRegionId() ).getName());
							wayBill.setDestinationSubRegion(cache.getGenericSubRegionById(request, destBranch.getSubRegionId() ).getName());

							final var flag = true;

							if(dispatchHM != null && dispatchHM.get(wayBill.getWayBillId()) != null) {
								if(flag)
									if(showVehicleNumberBookingTypeWise) {
										if(wayBill.getBookingTypeId() != BookingTypeConstant.BOOKING_TYPE_FTL_ID)
											wayBill.setVehicleNumber("--");
									} else
										wayBill.setVehicleNumber(dispatchHM.get(wayBill.getWayBillId()).getVehicleNumber());
							} else
								wayBill.setVehicleNumber("--");

							wayBill.setDeliveryTimeTbb(conSummaryHM.get(wayBill.getWayBillId()).isDeliveryTimeTBB());
							wayBill.setConsigneeName(consigneeDetails.get(wayBill.getWayBillId()).getName());
							wayBill.setConsignorName(consignorDetails.get(wayBill.getWayBillId()).getName());

							final var otherChargeDetails = new StringJoiner(", ");

							if(wayBill.getBookingAmount() > 0 && wayBill.getDeliveryAmount() > 0){
								consDetails 	  = wayBillDetails.get(wayBill.getWayBillId()).getConsignmentDetails();
								wayBillCharges 	  = wayBillDetails.get(wayBill.getWayBillId()).getWayBillCharges();
								taxes 			  = wayBillDetails.get(wayBill.getWayBillId()).getWayBillTaxTxn();
								wayBill.setDiscount(wbDtls.get(wayBill.getWayBillId()).getBookingDiscount());
								wayBill.setDeliveryDiscount(wbDtls.get(wayBill.getWayBillId()).getDeliveryDiscount());
							} else {
								consDetails 	  = wayBillBookingDetails.get(wayBill.getWayBillId()).getConsignmentDetails();
								wayBillCharges 	  = wayBillBookingDetails.get(wayBill.getWayBillId()).getWayBillCharges();
								taxes 			  = wayBillBookingDetails.get(wayBill.getWayBillId()).getWayBillTaxTxn();
								wayBill.setDiscount(wbDtls.get(wayBill.getWayBillId()).getBookingDiscount());
							}

							final var 	packageDetails  = new StringJoiner(" / ");
							final var  packingType 	= new StringJoiner(" / ");
							final var 	saidToContain	= new StringJoiner(" / ");

							wayBill.setConsignmentDetails(consDetails);

							// Consignment Detail
							for (final ConsignmentDetails consDetail : consDetails) {
								totalPkgQty += consDetail.getQuantity();

								packageDetails.add(consDetail.getQuantity() + " " + consDetail.getPackingTypeName());
								saidToContain.add(consDetail.getSaidToContain());
								packingType.add(consDetail.getPackingTypeName());
							}

							wayBill.setPackageDetails(packageDetails.toString());
							wayBill.setSaidToContain(saidToContain.toString());
							wayBill.setQuantity(totalPkgQty);
							wayBill.setDeliveryDateTime(wb.getDeliveryDateTime());
							wayBill.setPackingType(packingType.toString());

							if(wayBill.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
								wayBill.setArticleRate(wayBill.getWeightRate()+"");
							else if(wayBill.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
								if(consDetails.length == 1)
									wayBill.setArticleRate(wayBill.getArticleAmount()/ wayBill.getQuantity()+"");
								else {
									final var articleRate = Arrays.stream(consDetails).map(cd -> String.valueOf(cd.getAmount())).collect(Collectors.joining("/ "));
									wayBill.setArticleRate(articleRate);
								}
							} else if(wayBill.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
								wayBill.setArticleRate(ChargeTypeConstant.CHARGETYPE_NAME_FIX);

							//Charge Details
							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.DOOR_DELIVERY_BOOKING)
									wayBill.setDdCharge(wayBill.getDdCharge() + wayBillCharge.getChargeAmount());

								if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
									wayBill.setFreightCharge(wayBill.getFreightCharge() + wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.OCTROI_BOOKING
										|| wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.OCTROI_DELIVERY)
									wayBill.setOctroiCharge(wayBill.getOctroiCharge() + wayBillCharge.getChargeAmount());
								else if((executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA
										||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT)
										&& (wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.HAMALI
										|| wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.HAMALI_DELIVERY))
									wayBill.setHamaliCharge(wayBill.getHamaliCharge() + wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getChargeAmount() > 0) {
									otherCharges += wayBillCharge.getChargeAmount();
									otherChargeDetails.add(cache.getChargeTypeMasterById(request, wayBillCharge.getWayBillChargeMasterId()).getChargeName() + " : " + Math.round(wayBillCharge.getChargeAmount()));
								}

								wayBillChrgsArrList.add(wayBillCharge);
								wayBillChargesCol.put((short) wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
								wayBillChargesColForJSON.put((short) wayBillCharge.getWayBillChargeMasterId(), Converter.DtoToHashMap(wayBillCharge));
							}

							//Tax Details
							for (final WayBillTaxTxn element : taxes) {
								element.setTaxName(cache.getTaxMasterById(request, element.getTaxMasterId()).getTaxMasterName());
								wayBill.setTaxMasterId(element.getTaxMasterId());
								wayBill.setTaxAmount(element.getTaxAmount() + wayBill.getTaxAmount());
								wayBill.setUnAddedTaxAmount(element.getUnAddedTaxAmount() + wayBill.getUnAddedTaxAmount());
							}

							wayBill.setWayBillTaxTxn(taxes);
							//Get Remark
							if(printBookingTimeRemark && toPayWbBkgDtCol != null && toPayWbBkgDtCol.get(wayBill.getWayBillId()) != null)
								wayBill.setRemark(toPayWbBkgDtCol.get(wayBill.getWayBillId()).getRemark());
							else
								wayBill.setRemark(wbDtls.get(wayBill.getWayBillId()).getRemark());

							//Get InvoiceNo and InvoiceDate
							if(wbDtls.get(wayBill.getWayBillId()).getInvoiceDate() != null)
								wayBill.setInvoiceDate(wbDtls.get(wayBill.getWayBillId()).getInvoiceDate());

							if(invoiceDateData != null && invoiceDateData.containsKey(wayBill.getWayBillId()))
								wayBill.setInvoiceDateString(invoiceDateData.getOrDefault(wayBill.getWayBillId(), "--"));
							else
								wayBill.setInvoiceDateString("--");

							if(invoicNoData != null && invoicNoData.containsKey(wayBill.getWayBillId()))
								wayBill.setInvoiceNo(invoicNoData.getOrDefault(wayBill.getWayBillId(), "--"));
							else if(wbDtls != null && wbDtls.get(wayBill.getWayBillId()).getConsignorInvoiceNo() != null)
								wayBill.setInvoiceNo(wbDtls.get(wayBill.getWayBillId()).getConsignorInvoiceNo());

							if(conSummaryHM != null && conSummaryHM.get(wayBill.getWayBillId()) != null) {
								vehicleType = cache.getVehicleType(request, executive.getAccountGroupId(), conSummaryHM.get(wayBill.getWayBillId()).getVehicleTypeId());

								if(vehicleType != null)
									wayBill.setVehicleType(vehicleType.getName());
								else
									wayBill.setVehicleType("--");

							} else
								wayBill.setVehicleType("--");

							if(consignmentSummaryHM != null && consignmentSummaryHM.get(wayBill.getWayBillId()) != null) {
								serviceTaxPaidById	= consignmentSummaryHM.get(wayBill.getWayBillId()).getTaxBy();
								wayBill.setTaxPaidBy(TransportCommonMaster.getTaxPaidBy(serviceTaxPaidById));
							}
							//Way bill Income
							if(wbIncomeCol != null) {
								final List<WayBillIncome>	wbIncomeArr = wbIncomeCol.get(wayBill.getWayBillId());

								if(wbIncomeArr != null)
									for (final WayBillIncome element : wbIncomeArr) {
										otherCharges += element.getAmount();
										otherChargeDetails.add(element.getIncomeName() + " : " + Math.round(element.getAmount()));
									}
							}

							//Set otherCharges
							wayBill.setOtherCharge(otherCharges);
							wayBill.setTotalOtherCharges(totalOtherCharges);

							//Set Other Charges Details
							if(otherChargeDetails.length() > 0)
								wayBill.setOtherChargeDetails(otherChargeDetails.toString());

							wayBill.setGrandTotal(wayBill.getGrandTotal());
							lrWiseWayBillChargesCol.put(wayBill.getWayBillId(),wayBillChargesCol);
							lrWiseWayBillChargesColForJSON.put(wayBill.getWayBillId(), wayBillChargesColForJSON);

							wayBill.setPodRemark(Utility.checkedNullCondition(wayBill.getPodRemark(), (short) 1));

							if(contDetailsCol != null && contDetailsCol.size() > 0)
								contArr = contDetailsCol.get(wayBill.getWayBillId());

							wayBill.setContainerNumber("");

							if(contArr != null && !contArr.isEmpty())
								for(final ContainerDetails container : contArr)
									if("".equals(wayBill.getContainerNumber()))
										wayBill.setContainerNumber(container.getContainerNumber());
									else
										wayBill.setContainerNumber(wayBill.getContainerNumber() + " , " + container.getContainerNumber());

							final var 	pair	= SplitLRNumber.getNumbers(wayBill.getWayBillNumber());

							if(pair != null) {
								wayBill.setSrcBranchCode(pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
								wayBill.setLrNumberForSorting(pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
							}
						}
					}

					if ((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.ADD_LR_INCOME_IN_INVOICE_AMOUNT, false)) {
						final var lrIncomeDetails = BillDaoImpl.getInstance().getLrIncomeAmount(Long.toString(billId));
						wayBills[0].setIncomeAmount(lrIncomeDetails.getOrDefault(billId, 0.0));
					}

					request.setAttribute("lrWiseWayBillChargesCol", lrWiseWayBillChargesCol);
					request.setAttribute("executiveAdress", cache.getGenericBranchDetailCache(request, executive.getBranchId()).getAddress());
					request.setAttribute("toPayWbBkgDtCol", toPayWbBkgDtCol);
					request.setAttribute("consSmry", consignmentSummaryHM);
					request.setAttribute("bankAccountList", bankAccountList);

					final var subRegionList	= CollectionUtility.getLongListFromString((String) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.SUB_REGION_IDS_FOR_LR_NUMBER_WISE_SORTING, "0"));

					if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.BOOKING_DATE_AND_LR_NUMBER_WISE_SORTING, false))
						finalListArrNew	= SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::getBookingDateTime, WayBillDetailsForPrintingBill::getSrcBranchCode, WayBillDetailsForPrintingBill::getLrNumberForSorting);
					else if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.LR_NUMBER_WISE_SORTING, false) && (subRegionList.isEmpty() || subRegionList.contains(executive.getSubRegionId())))
						finalListArrNew	= SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::getSrcBranchCode, WayBillDetailsForPrintingBill::getLrNumberForSorting);
					else if((boolean) invoiceConfiguration.getOrDefault(CreditorInvoicePropertiesConstant.IS_SHOW_SEQUENCE_WISE_BILL, false))
						finalListArrNew	= SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::getBillSummaryId);
					else if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.IS_FTL_BOOKING_TYPE_SORTING, false))
						finalListArrNew	= SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::isFTLBooking);
					else if((boolean) printConfiguration.getOrDefault(CreditorInvoicePrintPropertiesConstant.LR_DATE_WISE_SORTING, false))
						finalListArrNew	= SortUtils.sortList(Arrays.asList(wayBills), WayBillDetailsForPrintingBill::getBookingDateTime);

					if(finalListArrNew != null) {
						finalWayBills = new WayBillDetailsForPrintingBill[finalListArrNew.size()];
						finalListArrNew.toArray(finalWayBills);
					}

					wayBillChrgsArr	= new WayBillCharges[wayBillChrgsArrList.size()];
					wayBillChrgsArrList.toArray(wayBillChrgsArr);

					if(wayBills.length == 1) {
						bill.setInvoiceNo(wayBills[0].getInvoiceNo());

						if(wayBills[0].getInvoiceDate() != null)
							bill.setInvoiceDateStr(DateTimeUtility.getDateFromTimeStamp(wayBills[0].getInvoiceDate(), DateTimeFormatConstant.DD_MM_YYYY));
						else
							bill.setInvoiceDateStr("");
					} else {
						bill.setInvoiceNo("");
						bill.setInvoiceDateStr("");
					}

					bill.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(bill.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YYYY));
					bill.setFinancialYear(DateTimeUtility.getFinancialYearCombination(bill.getCreationDateTimeStamp()));

					print.put("BillDetailsForPrintingBill", Converter.DtoToHashMap(bill));
					print.put("WayBillDetailsForPrintingBill", Converter.arrayDtotoArrayListWithHashMapConversion(wayBills));
					print.put("wayBillCharges", Converter.arrayDtotoArrayListWithHashMapConversion(wayBillChrgsArr));

					request.setAttribute("wayBillDetailsList", finalListArrNew);

					if(finalWayBills != null && finalWayBills.length > 0)
						request.setAttribute("WayBillDetailsForPrintingBill", finalWayBills);
					else
						request.setAttribute("WayBillDetailsForPrintingBill", wayBills);

					request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));
				}

				request.setAttribute("customAddressBranchId", bill.getBranchId());
				request.setAttribute("customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("deliveryContactDetails",deliveryContactDetails);
				request.setAttribute("accountGroup",accountGroup);
				request.setAttribute("lrTypeListToAllowInDecimal", lrTypeListToAllowInDecimal);
				request.setAttribute("billTaxTxnDetails", billTaxTxnDetails);
				request.setAttribute("branch", cache.getGenericBranchDetailCache(request, bill.getBranchId()));

				if(deliveryContactDetails != null){
					deliveryContactDetailsJsonObj = new HashMap<>();

					for (final Map.Entry<Long, DeliveryContactDetails> entry : deliveryContactDetails.entrySet())
						deliveryContactDetailsJsonObj.put(entry.getKey(), Converter.DtoToHashMap(entry.getValue()));

					print.put("deliveryContactDetails", deliveryContactDetailsJsonObj);
				}

				JsonConstant.getInstance().setOutputConstant(print);

				valueObject		= new ValueObject();
				valueObject.put("printJson", print);

				final var object = JsonUtility.convertionToJsonObjectForResponse(valueObject);

				request.setAttribute("printJsonObject", object);

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if(isLaserPrint)
				request.setAttribute("nextPageToken", "success_ledger_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}