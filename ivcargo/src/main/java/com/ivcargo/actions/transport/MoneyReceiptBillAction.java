package com.ivcargo.actions.transport;

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

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dao.impl.BankPaymentDaoImpl;
import com.iv.dao.impl.bill.BillClearanceDaoImpl;
import com.iv.dto.BillClearance;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.CustomerDetailsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.GenericStreamUtils;
import com.iv.utils.utility.MapUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BankAccountDao;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.WayBillChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillTaxTxnDao;
import com.platform.dao.reports.BillSummaryDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dao.waybill.MoneyReceiptTxnDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.MoneyReceiptTxn;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;


public class MoneyReceiptBillAction  implements Action {

	public static final String TRACE_ID = MoneyReceiptBillAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 						error 							= null;
		MoneyReceiptTxn									moneyReceiptTxnData				= null;
		var												isMultipleStbsSettlement		= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 						= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			var			wayBillId 						= JSPUtility.GetLong(request, "wayBillId", 0);
			final var	moduleIdentifier 				= JSPUtility.GetShort(request, "moduleIdentifier");
			var			clearanceId						= JSPUtility.GetLong(request, "clearanceId", 0);
			final var	multipleCrModuleIdentifier		= JSPUtility.GetLong(request, "multipleCrModuleIdentifier", 0);
			final var	ddmSettlementModuleIdentifier	= JSPUtility.GetLong(request, "ddmSettlementModuleIdentifier", 0);
			final var	billIds 						= JSPUtility.GetString(request, "billIds", null);
			var			billClearanceIds 				= JSPUtility.GetString(request, "billClearanceIds", null);
			final var	differentMrPrintForParitalPayment 	= JSPUtility.GetBoolean(request, "differentMrPrintForParitalPayment",false);
			final var	isMRPrintFromLrView 				= JSPUtility.GetBoolean(request, "isMRPrintFromLrView",false);
			final var	creditWayBillTxnClearanceId			= JSPUtility.GetLong(request, "creditWayBillTxnClearanceId", 0);
			final var	mrPrintFromInvoiceSearch 			= JSPUtility.GetBoolean(request, "mrPrintFromInvoiceSearch",false);
			final var	billClearanceBranchId				= JSPUtility.GetLong(request, "billClearanceBranchId", 0);
			final var	moneyReceiptTxnId					= JSPUtility.GetLong(request, "moneyReceiptTxnId", 0);
			final var	billCleranceId						= JSPUtility.GetLong(request, "billCleranceId", 0);
			final var	moneyReceiptNumber					= JSPUtility.GetString(request, "moneyReceiptNumber", null);

			final var	cache    					= new CacheManip(request);
			final var	lrViewConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	defaultMRPrint				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DEFAULT_MR_PRINT, false);

			final var	inValObj 			= new ValueObject();

			inValObj.put("wayBillId", wayBillId);
			inValObj.put("accountGroupId", executive.getAccountGroupId());

			if(differentMrPrintForParitalPayment) {
				final var wayBillIdList		= CollectionUtility.getLongListFromString(billIds);
				final var clearanceIdList	= CollectionUtility.getLongListFromString(billClearanceIds);

				wayBillId   = !wayBillIdList.isEmpty() ? wayBillIdList.get(0) : 0;
				clearanceId = !clearanceIdList.isEmpty() ? clearanceIdList.get(0) : 0;
			}

			switch (moduleIdentifier) {
			case (short) ModuleIdentifierConstant.BILL_PAYMENT -> {
				final var whereClause	= new StringJoiner(" AND ");

				if(moneyReceiptNumber != null)
					whereClause.add("mrt.MoneyReceiptNumber = '" + StringUtils.replace(moneyReceiptNumber, "'", "") + "'");

				whereClause.add("mrt.Id = " + wayBillId);
				whereClause.add("mrt.SubId = " + clearanceId);
				whereClause.add("mrt.ModuleIdentifier = " + moduleIdentifier);

				moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsForInvoice(whereClause.toString(), moneyReceiptTxnId);
			}
			case (short) ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT -> {
				moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsForShortCreditPayment(wayBillId, moduleIdentifier, clearanceId);

				if(isMRPrintFromLrView) {
					final var  billClearanceIdsList = CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetailsByCreditWayBillTxnClearanceId(creditWayBillTxnClearanceId);

					if(billClearanceIdsList != null && !billClearanceIdsList.isEmpty())
						billClearanceIds = billClearanceIdsList.stream().map(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnClearanceSummaryId).map(Object::toString).collect(Collectors.joining(", "));
				}
			}
			case (short) ModuleIdentifierConstant.GENERATE_CR, (short) ModuleIdentifierConstant.DDM_SETTLEMENT, (short) ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR -> {
				moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsForMultipleCRAndDDMSettlement(wayBillId, moduleIdentifier);
			}
			case (short) ModuleIdentifierConstant.STBS_SETTLEMENT -> {
				moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsSTBS(wayBillId, moduleIdentifier);

				if(moneyReceiptTxnData == null)
					moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsSTBS(wayBillId, ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE);
			}
			case (short) ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE -> {
				if(differentMrPrintForParitalPayment && StringUtils.isNotEmpty(billIds) && clearanceId > 0) {
					moneyReceiptTxnData = new MoneyReceiptTxn();
					moneyReceiptTxnData.setAccountGroupId(executive.getAccountGroupId());
					moneyReceiptTxnData.setWayBillIds(billIds);
					moneyReceiptTxnData.setModuleIdentifier(ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE);
					moneyReceiptTxnData.setSubId(clearanceId);

					isMultipleStbsSettlement = StringUtils.contains(billIds, ",");

					if(!isMultipleStbsSettlement)
						moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getLatestMRTxnDetailsSTBS(wayBillId, ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE);

				} else
					moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsSTBS(wayBillId, moduleIdentifier);
			}
			default -> moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetails(wayBillId, moduleIdentifier);
			}

			if((moneyReceiptTxnData != null && moneyReceiptTxnData.getModuleIdentifier() != ModuleIdentifierConstant.BOOKING || moneyReceiptTxnData == null) && wayBillId > 0 && moneyReceiptTxnData == null) {
				if(moneyReceiptTxnData == null)
					moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsForMultipleCRAndDDMSettlement(wayBillId, multipleCrModuleIdentifier);

				if(moneyReceiptTxnData == null)
					moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsForMultipleCRAndDDMSettlement(wayBillId, ddmSettlementModuleIdentifier);
			}

			if(moneyReceiptTxnData == null) {
				response.sendRedirect("errors.do?pageId=0&eventId=1&filter=25");
				return;
			}

			ActionStaticUtil.setReportViewModel(request);

			if(moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.BOOKING)
				getBookingMRDetails(request, wayBillId, executive, moneyReceiptTxnData);
			else if (moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.BILL_PAYMENT)
				getInvoicePaymentMRDetails(request, moneyReceiptTxnData, executive, mrPrintFromInvoiceSearch, differentMrPrintForParitalPayment, billClearanceBranchId, billClearanceIds, billCleranceId);
			else if (moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.STBS_SETTLEMENT)
				getSTBSMRDetails(request, moneyReceiptTxnData);
			else if(moduleIdentifier == ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE)
				getSTBSBillWiseMRDetails(request, moneyReceiptTxnData, executive, isMultipleStbsSettlement, differentMrPrintForParitalPayment);
			else if (moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT)
				getShortCreditMRDetailsForSingleLR(request, moneyReceiptTxnData, executive, wayBillId, differentMrPrintForParitalPayment, billClearanceIds);
			else if(moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.GENERATE_CR
					|| moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR
					|| moneyReceiptTxnData.getModuleIdentifier() == ModuleIdentifierConstant.DDM_SETTLEMENT)
				getDeliveryTimeMRDetails(request, moneyReceiptTxnData, executive);

			request.setAttribute("executive", executive);

			if(defaultMRPrint)
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void getBookingMRDetails(HttpServletRequest request, long wayBillId, Executive executive, MoneyReceiptTxn moneyReceiptTxnData) throws Exception {
		try {
			final var	cache    					= new CacheManip(request);

			final var	consignee 						= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)2, wayBillId, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);
			final var	consignor 						= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)1, wayBillId, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID);
			final var	wayBill 						= WayBillDao.getInstance().getByWayBillId(wayBillId);
			final var	wayBillCharges 					= WayBillChargesDao.getInstance().getWayBillCharges(wayBill.getWayBillId(), wayBill.getStatus());
			final var	bookingCharges					= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	consignmentSummary				= ConsignmentSummaryDao.getInstance().getConsignmentSummary(wayBillId);
			final var	bankPayment						= BankPaymentDaoImpl.getInstance().getBankPaymentByIdAndIdentifier1(wayBillId, ModuleIdentifierConstant.BOOKING);
			final var	consignmentDetails				= ConsignmentDetailsDao.getInstance().getConsignmentDetials(0, wayBillId);
			final List<ConsignmentDetails>	consignmentDetailsList			= Arrays.asList(consignmentDetails);
			final var	billSummary 						= BillSummaryDAO.getInstance().getBillDetailsByLRId(wayBill.getWayBillId());

			final var	wayBillChargesCol 	= new HashMap<Long, WayBillCharges>();

			final var	bookedByExec = ExecutiveDao.getInstance().getExecutiveMasterById(wayBill.getExecutiveId());
			wayBill.setbookedByName(bookedByExec.getName());

			final var	bookedByBookingBranchExe = ExecutiveDao.getInstance().getExecutiveMasterById(wayBill.getBookedByExecutiveId());
			wayBill.setBookingExecutiveName(bookedByBookingBranchExe != null ? bookedByBookingBranchExe.getName() : "");

			final var	tdsAmountDetails	= TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_PAID_BOOKING, wayBillId);

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var	chargeTypeMaster 	= cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
					final var	bookingChargesHm	= cache.getBookingChargesHm(request, executive);

					if(bookingChargesHm != null)
						if(bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()) != null)
							wayBillCharge.setName(bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()).getDisplayName());
						else if(chargeTypeMaster != null)
							wayBillCharge.setName(chargeTypeMaster.getChargeName());

					if(wayBillCharge.getWayBillChargeMasterId()== BookingChargeConstant.OTHER_BOOKING)
						moneyReceiptTxnData.setOtherCharge(wayBillCharge.getChargeAmount());

					wayBillChargesCol.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			final var	waybillTanTxn =	WayBillTaxTxnDao.getInstance().getWayBillTaxTxn(0, wayBill.getWayBillId());

			if(waybillTanTxn != null)
				request.setAttribute("wayBillTaxTxn", Stream.of(waybillTanTxn).filter(e -> e.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING).toList());

			request.setAttribute("customAddressBranchId", wayBill.getSourceBranchId());
			request.setAttribute("customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			moneyReceiptTxnData.setServiceTaxCharge(wayBill.getBookingTimeServiceTax());
			moneyReceiptTxnData.setMoneyReceiptAmount(wayBill.getBookingTotal() - wayBill.getBookingTimeServiceTax());
			moneyReceiptTxnData.setMoneyReceiptTotalAmount(wayBill.getGrandTotal()-wayBill.getBookingTimeServiceTax());
			moneyReceiptTxnData.setMoneyReceiptNetAmount(wayBill.getGrandTotal());
			moneyReceiptTxnData.setMoneyReceiptDiscount(wayBill.getBookingDiscount());
			moneyReceiptTxnData.setPaymentTypeName(PaymentTypeConstant.getPaymentType(consignmentSummary.getPaymentType()));
			moneyReceiptTxnData.setBillNumber(wayBill.getWayBillNumber());
			moneyReceiptTxnData.setWaybillDate(DateTimeUtility.getDateFromTimeStamp(wayBill.getCreationDateTimeStamp()));
			moneyReceiptTxnData.setBillingPartyName(consignor.getName());
			moneyReceiptTxnData.setBillingPartyAddress(consignor.getAddress());
			moneyReceiptTxnData.setBillingPartyPanNumber(consignor.getPanNumber());
			moneyReceiptTxnData.setBillingPartyGstn(consignor.getGstn());
			moneyReceiptTxnData.setExecutiveName(wayBill.getbookedByName());
			moneyReceiptTxnData.setBookingExecutiveName(wayBill.getBookingExecutiveName());
			moneyReceiptTxnData.setPaymentTypeId(consignmentSummary.getPaymentType());
			moneyReceiptTxnData.setQuantity(consignmentSummary.getQuantity());
			moneyReceiptTxnData.setActualWeight(consignmentSummary.getActualWeight());
			moneyReceiptTxnData.setChargeWeight(consignmentSummary.getChargeWeight());
			moneyReceiptTxnData.setPaymentRequiredName(consignmentSummary.getPaymentRequiredName());
			moneyReceiptTxnData.setSourceBranchName(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getName());
			moneyReceiptTxnData.setDestinationBranchName(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());
			moneyReceiptTxnData.setSourceBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getBranchCode());
			moneyReceiptTxnData.setDestinationBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getBranchCode());
			moneyReceiptTxnData.setWaybillTypeName(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));
			moneyReceiptTxnData.setBookingTypeId(consignmentSummary.getBookingTypeId());
			moneyReceiptTxnData.setMobileNumber(consignor.getMobileNumber());
			moneyReceiptTxnData.setRemark(wayBill.getRemark());
			moneyReceiptTxnData.setPrivateMark(consignmentSummary.getPrivateMarka());
			moneyReceiptTxnData.setWeightRate(consignmentSummary.getWeigthFreightRate());
			moneyReceiptTxnData.setChargeTypeId(consignmentSummary.getChargeTypeId());

			if(consignmentSummary.getChequeNumber() != null)
				moneyReceiptTxnData.setChequeNumber(consignmentSummary.getChequeNumber());
			else
				moneyReceiptTxnData.setChequeNumber("--");

			moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(consignmentSummary.getChequeDate()));

			if(consignmentSummary.getBankName() != null)
				moneyReceiptTxnData.setBankName(consignmentSummary.getBankName());
			else
				moneyReceiptTxnData.setBankName("--");

			if(bankPayment != null) {
				final var    bankAcount = BankAccountDao.getInstance().getBankAccountDetailsByBankAccountId(bankPayment.getBankAccountId());

				if(bankAcount != null)
					moneyReceiptTxnData.setCompanyAccountNumber(bankAcount.getAccountNumber());
				else
					moneyReceiptTxnData.setCompanyAccountNumber("--");
			} else
				moneyReceiptTxnData.setCompanyAccountNumber("--");

			moneyReceiptTxnData.setBookingBranchName(cache.getGenericBranchDetailCache(request, wayBill.getBookingBranchId()).getName());

			if(tdsAmountDetails != null)
				moneyReceiptTxnData.setTdsAmount(tdsAmountDetails.getTdsAmount());

			moneyReceiptTxnData.setPackingType(consignmentDetailsList.stream().map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining(",")));

			if(billSummary != null)
				billSummary.setCreationTimeStampStr(DateTimeUtility.getDateFromTimeStamp(billSummary.getCreationTimestamp()));

			if(wayBill != null)
				wayBill.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(wayBill.getBookingDateTime()));

			final var moneyReceiptTxnDataArr = new ArrayList<>();
			moneyReceiptTxnDataArr.add(moneyReceiptTxnData);

			request.setAttribute("bookingCharges", bookingCharges);
			request.setAttribute("wayBillCharges", wayBillCharges);
			request.setAttribute("wayBillChargesCol", wayBillChargesCol);
			request.setAttribute("consignmentSummary", consignmentSummary);
			request.setAttribute("consignmentDetails", consignmentDetails);
			request.setAttribute("billSummary", billSummary);
			request.setAttribute("consignor", consignor);
			request.setAttribute("consignee", consignee);
			request.setAttribute("wayBill", wayBill);
			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getInvoicePaymentMRDetails(HttpServletRequest request, MoneyReceiptTxn moneyReceiptTxnData, Executive executive, boolean mrPrintFromInvoiceSearch, boolean differentMrPrintForParitalPayment, long billClearanceBranchId, String billClearanceIds, long billCleranceId) throws Exception {
		try {
			final var	cache    					= new CacheManip(request);

			if(mrPrintFromInvoiceSearch)
				billClearanceIds = MoneyReceiptTxnDao.getInstance().getBillClearanceIdsByMoneyReceiptNumber(moneyReceiptTxnData.getMoneyReceiptNumber(), executive.getAccountGroupId(), billClearanceBranchId, moneyReceiptTxnData.getModuleIdentifier());

			final var	outValueObject 	= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForCreditorInvoice(moneyReceiptTxnData, differentMrPrintForParitalPayment, billClearanceIds, billCleranceId);

			moneyReceiptTxnData		= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
			final var	moneyReceiptTxnDataArr  = (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");

			final var billIdString = CollectionUtility.joinFilteredUnique(moneyReceiptTxnDataArr, e -> e.getBillId() > 0, MoneyReceiptTxn::getBillId);

			moneyReceiptTxnData.setPaymentTypeName(PaymentTypeConstant.getPaymentType(moneyReceiptTxnData.getPaymentTypeId()));
			final var	sourceBranch = cache.getBranchById(request, executive.getAccountGroupId(), moneyReceiptTxnDataArr.get(0).getSourceBranchId());

			moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getChequeDate()));

			setUniqueData(moneyReceiptTxnData, moneyReceiptTxnDataArr);

			if(!billIdString.isEmpty()) {
				final var	billList = BillClearanceDaoImpl.getInstance().getBillClearanceDetailsForView(billIdString);

				final var negotiatedBillIds = CollectionUtility.joinFilteredUnique(billList, e -> e.getBillClearanceStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID, BillClearance::getBillClearanceBillId);

				if(!negotiatedBillIds.isEmpty()) {
					final var	billClearanceDetails = BillClearanceDaoImpl.getInstance().getBillClearanceDetailsWithTotalReceivedAmount(negotiatedBillIds);

					if(!billClearanceDetails.isEmpty())
						moneyReceiptTxnData.setTotalNegotiatedAmount(GenericStreamUtils.sumDouble(billClearanceDetails.entrySet(), entry -> entry.getValue().getBillClearanceGrandTotal() - entry.getValue().getBillClearanceTotalReceivedAmount()));
				}
			}

			final var bankAcount = BankAccountDao.getInstance().getBankAccountDetailsByBankAccountId(moneyReceiptTxnData.getBankAccountId());

			if(bankAcount != null && bankAcount.getAccountNumber() != null)
				moneyReceiptTxnData.setCompanyAccountNumber(bankAcount.getAccountNumber());
			else
				moneyReceiptTxnData.setCompanyAccountNumber("--");

			moneyReceiptTxnData.setPaymantStatusID(moneyReceiptTxnData.getPaymantStatusID());

			request.setAttribute("customAddressBranchId", moneyReceiptTxnDataArr.get(0).getSourceBranchId());
			request.setAttribute("customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);
			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("sourceBranch", sourceBranch);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getSTBSMRDetails(HttpServletRequest request, MoneyReceiptTxn moneyReceiptTxnData) throws Exception {
		try {
			final var	outValueObject  		= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForSTBS(moneyReceiptTxnData);
			moneyReceiptTxnData 	= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
			final var	moneyReceiptTxnDataArr  = (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");

			setUniqueData(moneyReceiptTxnData, moneyReceiptTxnDataArr);

			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getSTBSBillWiseMRDetails(HttpServletRequest request, MoneyReceiptTxn moneyReceiptTxnData,
			Executive executive, boolean isMultipleStbsSettlement, boolean differentMrPrintForParitalPayment) throws Exception {
		try {
			var			moneyReceiptTxnDataArr		= new ArrayList<MoneyReceiptTxn>();

			ValueObject 		stbsSettlementBillWiseObj = null;

			if(differentMrPrintForParitalPayment) {
				if(!isMultipleStbsSettlement) {
					moneyReceiptTxnData = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceipt(moneyReceiptTxnData.getMoneyReceiptNumber(), executive.getAccountGroupId(),moneyReceiptTxnData.getSourceBranchId());

					if(moneyReceiptTxnData != null) {
						moneyReceiptTxnData.setAccountGroupId(executive.getAccountGroupId());
						isMultipleStbsSettlement = StringUtils.contains(moneyReceiptTxnData.getWayBillIds(), ",");
					}
				}

				if(moneyReceiptTxnData != null) {
					stbsSettlementBillWiseObj  	= MoneyReceiptTxnDao.getInstance().getMultipleMoneyReceiptTxnDetailsSTBS(moneyReceiptTxnData);
					moneyReceiptTxnDataArr 		= (ArrayList<MoneyReceiptTxn>) stbsSettlementBillWiseObj.get("moneyReceiptTxnArr");

					if(ObjectUtils.isEmpty(moneyReceiptTxnDataArr))
						stbsSettlementBillWiseObj  =  MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForBillWiseSTBS(moneyReceiptTxnData);
				}
			} else
				stbsSettlementBillWiseObj  =  MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForBillWiseSTBS(moneyReceiptTxnData);

			if(stbsSettlementBillWiseObj != null) {
				moneyReceiptTxnData 	= (MoneyReceiptTxn) stbsSettlementBillWiseObj.get("moneyReceiptTxn");
				moneyReceiptTxnDataArr  = (ArrayList<MoneyReceiptTxn>) stbsSettlementBillWiseObj.get("moneyReceiptTxnArr");
			}

			if(moneyReceiptTxnData != null) {
				moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getChequeDate()));
				moneyReceiptTxnData.setPaymentTypeName(PaymentTypeConstant.getPaymentType(moneyReceiptTxnData.getPaymentTypeId()));
			}

			setUniqueData(moneyReceiptTxnData, moneyReceiptTxnDataArr);

			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);
			request.setAttribute("isMultipleStbsSettlement", isMultipleStbsSettlement);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getShortCreditMRDetailsForSingleLR(HttpServletRequest request, MoneyReceiptTxn moneyReceiptTxnData, Executive executive, long wayBillId, boolean differentMrPrintForParitalPayment, String billClearanceIds) throws Exception {
		try {
			final var	cache    					= new CacheManip(request);

			final var	wayBillChargesCol 	= new HashMap<Long, WayBillCharges>();

			final var	wayBill 						= WayBillDao.getInstance().getByWayBillId(moneyReceiptTxnData.getWayBillId());
			final var	wayBillCharges 					= WayBillChargesDao.getInstance().getWayBillCharges(wayBill.getWayBillId(), wayBill.getStatus());
			final var	bookingCharges					= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	waybillTanTxn 					= WayBillTaxTxnDao.getInstance().getWayBillTaxTxn(0, wayBill.getWayBillId());
			final var	consignmentDetails				= ConsignmentDetailsDao.getInstance().getConsignmentDetials(0,  wayBill.getWayBillId());
			final var	consignmentSummary				= ConsignmentSummaryDao.getInstance().getConsignmentSummary(wayBill.getWayBillId());
			final var	consignor 	= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short) 1, wayBill.getWayBillId(), CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID);
			final var	consignee	= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short) 2, wayBill.getWayBillId(), CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);

			final var	outValueObject  			= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptNumberForShortCreditPayment(moneyReceiptTxnData,differentMrPrintForParitalPayment,billClearanceIds);
			moneyReceiptTxnData 	= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
			final var	moneyReceiptTxnDataArr  = (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");

			moneyReceiptTxnData.setPaymentTypeName(PaymentTypeConstant.getPaymentType(moneyReceiptTxnData.getPaymentTypeId()));
			final var	sourceBranch = cache.getBranchById(request, executive.getAccountGroupId(), moneyReceiptTxnDataArr.get(0).getSourceBranchId());

			moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getChequeDate()));
			moneyReceiptTxnData.setSourceBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getBranchCode());
			moneyReceiptTxnData.setDestinationBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getBranchCode());

			if(StringUtils.isEmpty(moneyReceiptTxnData.getBillingPartyName()))
				if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					moneyReceiptTxnData.setBillingPartyName(consignee.getName());
				else
					moneyReceiptTxnData.setBillingPartyName(consignor.getName());

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
				moneyReceiptTxnData.setBillingPartyAddress(consignee.getAddress());
				moneyReceiptTxnData.setBillingPartyPanNumber(consignee.getPanNumber());
				moneyReceiptTxnData.setBillingPartyGstn(consignee.getGstn());
			} else {
				moneyReceiptTxnData.setBillingPartyAddress(consignor.getAddress());
				moneyReceiptTxnData.setBillingPartyPanNumber(consignor.getPanNumber());
				moneyReceiptTxnData.setBillingPartyGstn(consignor.getGstn());
			}

			if(moneyReceiptTxnData.getIssueBank() != null)
				moneyReceiptTxnData.setBankName(moneyReceiptTxnData.getIssueBank());
			else
				moneyReceiptTxnData.setBankName("--");

			moneyReceiptTxnData.setBookingBranchName(sourceBranch.getName());

			if(!differentMrPrintForParitalPayment) {
				final List<ConsignmentDetails>	consignmentDetailsList		= Arrays.asList(ConsignmentDetailsDao.getInstance().getConsignmentDetials(0, wayBillId));
				moneyReceiptTxnData.setPackingType(consignmentDetailsList.stream().map(e -> e.getQuantity()+" "+e.getPackingTypeName()).collect(Collectors.joining(",")));
			}

			setUniqueData(moneyReceiptTxnData, moneyReceiptTxnDataArr);

			final var	bookingChargesHm	= cache.getBookingChargesHm(request, executive);

			if(wayBillCharges != null && wayBillCharges.length > 0)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var	chargeTypeMaster 	= cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());

					if(bookingChargesHm != null)
						if(bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()) != null)
							wayBillCharge.setName(bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()).getDisplayName());
						else if(chargeTypeMaster != null)
							wayBillCharge.setName(chargeTypeMaster.getChargeName());

					wayBillChargesCol.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			if(wayBill != null)
				wayBill.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(wayBill.getBookingDateTime()));

			request.setAttribute("wayBillChargesCol", wayBillChargesCol);
			request.setAttribute("bookingCharges", bookingCharges);
			request.setAttribute("wayBillCharges", wayBillCharges);
			request.setAttribute("consignmentDetails", consignmentDetails);
			request.setAttribute("consignmentSummary", consignmentSummary);
			request.setAttribute("sourceBranch", sourceBranch);
			request.setAttribute("consignor", consignor);
			request.setAttribute("consignee", consignee);
			request.setAttribute("wayBill", wayBill);
			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);

			if(waybillTanTxn != null)
				request.setAttribute("wayBillTaxTxn", Stream.of(waybillTanTxn).filter(e -> e.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING).toList());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	@SuppressWarnings("unchecked")
	private void getDeliveryTimeMRDetails(HttpServletRequest request, MoneyReceiptTxn moneyReceiptTxnData, Executive executive) throws Exception {
		try {
			final var	cache    					= new CacheManip(request);

			final var	wayBillChargesCol 	= new HashMap<Long, WayBillCharges>();

			final var	outValueObject 	= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForMultipleCrAndDdmSettlement(moneyReceiptTxnData);
			final var	consignee 		= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)2, moneyReceiptTxnData.getWayBillId(), CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);
			final var	consignor 		= CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)1, moneyReceiptTxnData.getWayBillId(), CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID);

			final var	consignmentDetails				= ConsignmentDetailsDao.getInstance().getConsignmentDetials(0, moneyReceiptTxnData.getWayBillId());
			final var	billSummary 					= BillSummaryDAO.getInstance().getBillDetailsByLRId( moneyReceiptTxnData.getWayBillId());
			final var	bookingCharges					= cache.getActiveBookingCharges(request, executive.getBranchId());

			moneyReceiptTxnData 	= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
			final var	moneyReceiptTxnDataArr  = (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");
			final var	consignmentSummary				= ConsignmentSummaryDao.getInstance().getConsignmentSummary(moneyReceiptTxnData.getWayBillId());

			final var	wayBill 				= WayBillDao.getInstance().getByWayBillId(moneyReceiptTxnData.getWayBillId());

			moneyReceiptTxnData.setPaymentTypeName(PaymentTypeConstant.getPaymentType(moneyReceiptTxnData.getPaymentTypeId()));
			final var	sourceBranch = cache.getBranchById(request, executive.getAccountGroupId(), moneyReceiptTxnDataArr.get(0).getSourceBranchId());

			moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getChequeDate()));

			final var	deliveryCharges 					= WayBillChargesDao.getInstance().getWayBillCharges(wayBill.getWayBillId(), wayBill.getStatus());
			final var	bookingChargesHm					= cache.getBookingChargesHm(request, executive);

			if(deliveryCharges != null)
				for (final WayBillCharges deliveryCharge : deliveryCharges) {

					final var	chargeTypeMaster 	= cache.getChargeTypeMasterById(request,deliveryCharge.getWayBillChargeMasterId());

					if(deliveryCharge.getWayBillChargeMasterId()== BookingChargeConstant.OTHER_BOOKING)
						moneyReceiptTxnData.setOtherCharge(deliveryCharge.getChargeAmount());

					if(deliveryCharge.getWayBillChargeMasterId()== BookingChargeConstant.HAMALI)
						moneyReceiptTxnData.setHamaliCharge(deliveryCharge.getChargeAmount());

					if(deliveryCharge.getWayBillChargeMasterId()== BookingChargeConstant.DOOR_DELIVERY_BOOKING)
						moneyReceiptTxnData.setDdCharge(deliveryCharge.getChargeAmount());

					if(deliveryCharge.getWayBillChargeMasterId()== BookingChargeConstant.FREIGHT)
						moneyReceiptTxnData.setFreightCharge(deliveryCharge.getChargeAmount());

					if(bookingChargesHm != null)
						if(bookingChargesHm.get(deliveryCharge.getWayBillChargeMasterId()) != null)
							deliveryCharge.setName(bookingChargesHm.get(deliveryCharge.getWayBillChargeMasterId()).getDisplayName());
						else if(chargeTypeMaster != null)
							deliveryCharge.setName(chargeTypeMaster.getChargeName());

					wayBillChargesCol.put(deliveryCharge.getWayBillChargeMasterId(), deliveryCharge);
				}

			final var	waybillTanTxnDelivery =	WayBillTaxTxnDao.getInstance().getWayBillTaxTxn(0, moneyReceiptTxnData.getWayBillId());

			if(waybillTanTxnDelivery != null) {
				request.setAttribute("deliveryTaxTxnArrList", Stream.of(waybillTanTxnDelivery).filter(e -> e.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY).toList());
				request.setAttribute("bookingDelTaxTxnArrList", Stream.of(waybillTanTxnDelivery).filter(e -> e.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING).toList());
				request.setAttribute("wayBillTaxTxn", Stream.of(waybillTanTxnDelivery).filter(e -> e.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING).toList());
			}

			final var tdsAmountDetails	= TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_DELIVERY_CONTACT_DETAILS, moneyReceiptTxnData.getBillId());

			if(tdsAmountDetails != null)
				moneyReceiptTxnData.setTdsAmount(tdsAmountDetails.getTdsAmount());

			moneyReceiptTxnData.setSourceBranchName(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getName());
			moneyReceiptTxnData.setDestinationBranchName(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());
			moneyReceiptTxnData.setActualWeight(consignmentSummary.getActualWeight());
			moneyReceiptTxnData.setChargeWeight(consignmentSummary.getChargeWeight());
			moneyReceiptTxnData.setBillingPartyName(consignee.getName());
			moneyReceiptTxnData.setBillingPartyAddress(consignee.getAddress());
			moneyReceiptTxnData.setBillingPartyPanNumber(consignee.getPanNumber());
			moneyReceiptTxnData.setBillingPartyGstn(consignee.getGstn());
			moneyReceiptTxnData.setBookingBranchName(sourceBranch != null ? sourceBranch.getName() : "");
			moneyReceiptTxnData.setBookingTypeId(consignmentSummary.getBookingTypeId());
			moneyReceiptTxnData.setMobileNumber(consignor.getMobileNumber());
			moneyReceiptTxnData.setRemark(wayBill.getRemark());
			moneyReceiptTxnData.setPrivateMark(consignmentSummary.getPrivateMarka());
			moneyReceiptTxnData.setWeightRate(consignmentSummary.getWeigthFreightRate());
			moneyReceiptTxnData.setChargeTypeId(consignmentSummary.getChargeTypeId());
			moneyReceiptTxnData.setSourceBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getBranchCode());
			moneyReceiptTxnData.setDestinationBranchCode(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getBranchCode());
			moneyReceiptTxnData.setMoneyReceiptTotalAmount(wayBill.getGrandTotal()-wayBill.getDeliveryTimeServiceTax());
			moneyReceiptTxnData.setMoneyReceiptNetAmount(wayBill.getGrandTotal());

			if(moneyReceiptTxnDataArr.get(0).getChequeNumber() != null)
				moneyReceiptTxnData.setChequeNumber(moneyReceiptTxnDataArr.get(0).getChequeNumber());
			else
				moneyReceiptTxnData.setChequeNumber("--");

			if(moneyReceiptTxnDataArr.get(0).getIssueBank() != null)
				moneyReceiptTxnData.setIssueBank(moneyReceiptTxnDataArr.get(0).getIssueBank());
			else
				moneyReceiptTxnData.setIssueBank("--");

			if(moneyReceiptTxnDataArr.get(0).getReferenceNumber() != null)
				moneyReceiptTxnData.setReferenceNumber(moneyReceiptTxnDataArr.get(0).getReferenceNumber());
			else
				moneyReceiptTxnData.setReferenceNumber("--");

			final var bankAcount = BankAccountDao.getInstance().getBankAccountDetailsByBankAccountId(moneyReceiptTxnData.getBankAccountId());

			if(bankAcount != null && bankAcount.getAccountNumber() != null)
				moneyReceiptTxnData.setCompanyAccountNumber(bankAcount.getAccountNumber());
			else
				moneyReceiptTxnData.setCompanyAccountNumber("--");

			moneyReceiptTxnData.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnDataArr.get(0).getChequeDate()));

			if(billSummary != null)
				billSummary.setCreationTimeStampStr(DateTimeUtility.getDateFromTimeStamp(billSummary.getCreationTimestamp()));

			if(wayBill != null)
				wayBill.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(wayBill.getBookingDateTime()));

			if(ObjectUtils.isNotEmpty(moneyReceiptTxnDataArr))
				for(final MoneyReceiptTxn mr : moneyReceiptTxnDataArr) {
					mr.setTxnDateTimeString(DateTimeUtility.getDateFromTimeStamp(mr.getTxnDateTime()));
					mr.setPaymentTypeName(PaymentTypeConstant.getPaymentType(mr.getPaymentTypeId()));
				}

			if(moneyReceiptTxnData != null)
				moneyReceiptTxnData.setTxnDateTimeString(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getTxnDateTime(), "dd-MMM-yyyy"));

			request.setAttribute("consignmentDetails", consignmentDetails);
			request.setAttribute("billSummary", billSummary);
			request.setAttribute("consignmentSummary", consignmentSummary);
			request.setAttribute("wayBillChargesCol", wayBillChargesCol);
			request.setAttribute("bookingCharges", bookingCharges);
			request.setAttribute("wayBillCharges", deliveryCharges);
			request.setAttribute("sourceBranch", sourceBranch);
			request.setAttribute("consignor", consignor);
			request.setAttribute("consignee", consignee);
			request.setAttribute("wayBill", wayBill);
			request.setAttribute("moneyReceiptTxnData", moneyReceiptTxnData);
			request.setAttribute("moneyReceiptTxnDataArr", moneyReceiptTxnDataArr);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setUniqueData(MoneyReceiptTxn moneyReceiptTxnData, List<MoneyReceiptTxn> moneyReceiptTxnDataArr) {
		if(ObjectUtils.isNotEmpty(moneyReceiptTxnDataArr)) {
			final Map<Long, MoneyReceiptTxn> billWiseHM = MapUtils.toMap(moneyReceiptTxnDataArr, MoneyReceiptTxn::getBillId);
			final List<MoneyReceiptTxn>		mrList	= new ArrayList<>(billWiseHM.values());

			final var totalBillAmount			= GenericStreamUtils.sumDouble(mrList, MoneyReceiptTxn::getMoneyReceiptTotalAmount);
			final var totalAdditionalCharge		= GenericStreamUtils.sumDouble(mrList, MoneyReceiptTxn::getBillAdditionalCharge);
			final var billNumbers				= CollectionUtility.joinFilteredUnique(mrList, e -> e.getBillNumber() != null, MoneyReceiptTxn::getBillNumber, ", ");

			moneyReceiptTxnData.setMoneyReceiptTotalAmount(totalBillAmount);
			moneyReceiptTxnData.setBillAdditionalCharge(totalAdditionalCharge);
			moneyReceiptTxnData.setBillNumber(billNumbers);

			for(final MoneyReceiptTxn mr : moneyReceiptTxnDataArr) {
				mr.setTxnDateTimeString(DateTimeUtility.getDateFromTimeStamp(mr.getTxnDateTime()));
				mr.setPaymentTypeName(PaymentTypeConstant.getPaymentType(mr.getPaymentTypeId()));
			}
		}

		if(moneyReceiptTxnData != null)
			moneyReceiptTxnData.setTxnDateTimeString(DateTimeUtility.getDateFromTimeStamp(moneyReceiptTxnData.getTxnDateTime(), "dd-MMM-yyyy"));
	}
}
