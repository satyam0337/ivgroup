package com.ivcargo.reports.delivery;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dao.impl.reports.ShortCreditPaymentRegisterReportDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.model.reports.ShortCreditPaymentRegisterModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.delivery.initialize.InitializeDeliveryCashChequeStatementReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.GodownStockSummaryDao;
import com.platform.dao.reports.DeliveryCashChequeStatementDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.GodownStockReportForPendingDeliveryModel;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.modules.DlyCashChequeStatementReportConfigurationDTO;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DeliveryCashChequeStatementReport;
import com.platform.dto.model.DeliveryCashChequeStatementReportModel;
import com.platform.resource.CargoErrorList;

public class DeliveryCashChequeStatementReportAction implements Action {

	private static final String TRACE_ID = "DeliveryCashChequeStatementReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object>	 								error 						= null;
		Map<Long, Double>										wbIdWiseTDSAmt				= null;
		Map<String, DeliveryCashChequeStatementReportModel>		deliveryChargesHM			= null;
		var														receivedAmount				= 0D;
		var														cancelAmount				= 0D;
		var branchId		= 0L;
		var	tdsAmt			= 0D;
		var	totalTDSAmt		= 0D;
		var	totalDiscountAmount	= 0D;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDeliveryCashChequeStatementReportAction().execute(request, response);

			var	sdf								= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate						= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate							= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	objectIn						= new ValueObject();
			final var	cache							= new CacheManip(request);
			final var	executive						= cache.getExecutive(request);
			final var	formTypesBLL					= new FormTypesBLL();
			final var	execFldPermissionsHM 			= cache.getExecutiveFieldPermission(request);
			final var	deliveryCharges 				= cache.getDeliveryCharges(request, executive.getBranchId());
			final var	valueObjDlyReport				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DELIVERY_CASH_CHEQUE_STATEMENT_REPORT, executive.getAccountGroupId());
			final var	showBillCreditPaymentType		= valueObjDlyReport.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_BILL_CREDIT_PAYMENT_TYPE, false);
			final var	showPaymentWiseTable			= valueObjDlyReport.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_PAYMENT_WISE_TABLE, false);
			final var	showPendingStockDetailsTable	= valueObjDlyReport.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_PENDING_STOCK_DETAILS_TABLE, false);
			final var	addDiscountAmountInShortCreditReceivePayment			= valueObjDlyReport.getBoolean(DlyCashChequeStatementReportConfigurationDTO.ADD_DISCOUNT_AMOUNT_IN_SHORT_CREDIT_RECEIVE_PAYMENT, false);
			final var	discountModel					= new DeliveryCashChequeStatementReportModel();
			final var	shortCreditPaymentRegisterModel	= new ShortCreditPaymentRegisterModel();
			List<String>		finalCRumberList				= new LinkedList<>();
			final List<String> 	paymentTypeList					= new LinkedList<>();
			final Set<String>	chargesList						= new LinkedHashSet<>();

			request.setAttribute("DeliveryCharges", deliveryCharges);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			else
				branchId 	= executive.getBranchId();

			objectIn.put("destBranchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);

			if(request.getParameter("billType") != null)
				objectIn.put("billTypeId", Short.parseShort(request.getParameter("billType")));

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

			if(showPendingStockDetailsTable){
				final var	minDate			  					= cache.getMinDateInReports(request, executive.getAccountGroupId());
				final var	minDateTimeStamp   					= DateTimeUtility.getTimeStamp(minDate);
				final var	gdwnStockRprtForPendinDelivery		= new GodownStockReportForPendingDeliveryModel();

				gdwnStockRprtForPendinDelivery.setBranchId(branchId);
				gdwnStockRprtForPendinDelivery.setAccountGroupId(executive.getAccountGroupId());

				final List<GodownStockReportForPendingDeliveryModel>	gdwnStockRprtForPendinDeliveryArr	= GodownStockSummaryDao.getInstance().getGodownStockDetailsForPendingDelivery(gdwnStockRprtForPendinDelivery,minDateTimeStamp);

				if(gdwnStockRprtForPendinDeliveryArr != null && !gdwnStockRprtForPendinDeliveryArr.isEmpty()) {
					final var	godownStockReportForPendingDeliveryModel	= getFinalGdwnStockRprtForPendinDelivery(gdwnStockRprtForPendinDeliveryArr);
					request.setAttribute(GodownStockReportForPendingDeliveryModel.GODOWN_STOCK_REPORT_FOR_PENDING_DELIVERY, godownStockReportForPendingDeliveryModel);
				}
			}

			final var	reportModel = DeliveryCashChequeStatementDAO.getInstance().getDeliveryCashChequeStatement(objectIn);

			if(ObjectUtils.isNotEmpty(reportModel)) {
				final var wayBillIds 	= reportModel.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				final var dcdIds		= reportModel.stream().map(e -> Long.toString(e.getDeliveryContactDetailsId())).collect(Collectors.joining(Constant.COMMA));
				final Map<Long, Long> 	wbIdWithDcd	= reportModel.stream().collect(Collectors.toMap(DeliveryCashChequeStatementReport::getWayBillId, DeliveryCashChequeStatementReport::getDeliveryContactDetailsId, (e1, e2) -> e2));

				if(StringUtils.isNotEmpty(dcdIds)) {
					final var	valInObj = new ValueObject();
					valInObj.put(AliasNameConstants.WB_ID_ARRAY, wayBillIds);
					valInObj.put(AliasNameConstants.DCD_ID, dcdIds);
					valInObj.put(AliasNameConstants.WB_ID_WISE_DCD_IDS, wbIdWithDcd);

					wbIdWiseTDSAmt 		= TDSTxnDetailsBLL.getTDSAmoutForDelivery(valInObj);
				}

				if(showPaymentWiseTable) {
					shortCreditPaymentRegisterModel.setFromDate(fromDate);
					shortCreditPaymentRegisterModel.setToDate(toDate);
					shortCreditPaymentRegisterModel.setAccountGroupId(executive.getAccountGroupId());
					shortCreditPaymentRegisterModel.setBranchId(branchId);

					final var	shortCreditPaymentRegisterModelArrList 		= ShortCreditPaymentRegisterReportDaoImpl.getInstance().getShortCreditPaymentRegisterDetailsByBranchId(shortCreditPaymentRegisterModel, (short) 0);
					final var	shortCreditPaymentCancellatrionModelArrList = ShortCreditPaymentRegisterReportDaoImpl.getInstance().getShortCreditPaymentRegisterDetailsByBranchId(shortCreditPaymentRegisterModel, (short) 1);

					if(shortCreditPaymentRegisterModelArrList != null && !shortCreditPaymentRegisterModelArrList.isEmpty())
						for(final ShortCreditPaymentRegisterModel shrtModel : shortCreditPaymentRegisterModelArrList)
							if(addDiscountAmountInShortCreditReceivePayment && shrtModel.getPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
								receivedAmount = receivedAmount + shrtModel.getReceivedAmount() + (shrtModel.getGrandTotal() - shrtModel.getTotalReceivedAmount());
							else
								receivedAmount	+= shrtModel.getReceivedAmount();

					if(shortCreditPaymentCancellatrionModelArrList != null && !shortCreditPaymentCancellatrionModelArrList.isEmpty())
						for(final ShortCreditPaymentRegisterModel shrtCancelModel : shortCreditPaymentCancellatrionModelArrList)
							cancelAmount	+= shrtCancelModel.getReceivedAmount();

					final List<DeliveryCashChequeStatementReport>	reportList = reportModel.stream().collect(Collectors.toList());
					reportList.sort((r1, r2) -> Integer.compare(Integer.parseInt(r1.getWayBillDeliveryNumber()),
							Integer.parseInt(r2.getWayBillDeliveryNumber())));

					finalCRumberList = reportList.stream().map(DeliveryCashChequeStatementReport::getWayBillDeliveryNumber).collect(Collectors.toList());

					paymentTypeList.add(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID + "_" + PaymentTypeConstant.getPaymentType(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID));
					paymentTypeList.add(PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID + "_" + PaymentTypeConstant.getPaymentType(PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID));
					paymentTypeList.add(PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID + "_" + PaymentTypeConstant.getPaymentType(PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID));
				}

				final var 	wayBillIdArr	= CollectionUtility.getLongArrayFromString(wayBillIds, Constant.COMMA);
				final var	wayBillDetails 	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArr, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY ,false);

				final var	cnsgmtSumaryColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				final SortedMap<String, DeliveryCashChequeStatementReportModel>	dateWiseDataModel		= new TreeMap<>();
				sdf						= new SimpleDateFormat("dd-MM-yyyy");
				final var	paymentTypeColl			= new HashMap<Short, Double>();
				final var	formTypeHM				= formTypesBLL.getFormTypesWithName(wayBillIds);
				final Map<String, Map<String , DeliveryCashChequeStatementReportModel>>	paymentTypeHM			= new HashMap<>();

				final var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
				displayDataConfig.put("execFeildPermission", execFldPermissionsHM);

				final var	lrTypeWiseZeroAmtHM	= DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHMReport(displayDataConfig, reportModel.stream().filter(e -> e.getWayBillTypeId() > 0).map(DeliveryCashChequeStatementReport::getWayBillTypeId).collect(Collectors.toSet()), ReportIdentifierConstant.DELIVERY_CASH_CHEQUE_STATEMENT_REPORT);

				for (final DeliveryCashChequeStatementReport element : reportModel) {
					if(!showBillCreditPaymentType && element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
						continue;

					final boolean	isShowAmountZero	= lrTypeWiseZeroAmtHM.getOrDefault(element.getWayBillTypeId(), false);

					tdsAmt = 0;

					if(wbIdWiseTDSAmt != null && wbIdWiseTDSAmt.get(element.getWayBillId()) != null)
						tdsAmt		= wbIdWiseTDSAmt.get(element.getWayBillId());

					totalTDSAmt 			+= tdsAmt;
					totalDiscountAmount 	+= element.getDeliveryDiscount();

					if(isShowAmountZero) {
						element.setGrandTotal(0);
						element.setBookingTotal(0);
					}

					if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						element.setPaidAmount(element.getGrandTotal());
					else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						element.setTopayAmount(element.getGrandTotal());

					var	chargeCollection	= new HashMap<Long, Double>();

					for (final ChargeTypeModel deliveryCharge : deliveryCharges)
						chargeCollection.put(deliveryCharge.getChargeTypeMasterId(), 0.00);

					final var	wayBillCharges 	= wayBillDetails.get(element.getWayBillId()).getWayBillCharges();

					for (final WayBillCharges wayBillCharge : wayBillCharges)
						chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), !isShowAmountZero ? wayBillCharge.getChargeAmount() : 0);

					element.setChargesCollection(chargeCollection);

					final var	taxes 	= wayBillDetails.get(element.getWayBillId()).getWayBillTaxTxn();

					if(!isShowAmountZero)
						for (final WayBillTaxTxn taxe : taxes)
							element.setServiceTaxAmount(element.getServiceTaxAmount() + taxe.getTaxAmount());

					final var	consignmentSummary = cnsgmtSumaryColl.get(element.getWayBillId());
					element.setActualWeight(consignmentSummary.getActualWeight());
					element.setQuantity(consignmentSummary.getQuantity());

					if(formTypeHM.get(element.getWayBillId()) != null)
						element.setFormTypeName(formTypeHM.get(element.getWayBillId()));
					else
						element.setFormTypeName("-----");

					if(showPaymentWiseTable) {
						final var cashLesskey	= PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID + "_" + PaymentTypeConstant.getPaymentType(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID);
						final var payKey		= element.getPaymentTypeId() + "_" + PaymentTypeConstant.getPaymentType(element.getPaymentTypeId());

						if(PaymentTypeConstant.getBankPaymentList().contains(element.getPaymentTypeId())) {
							paymentTypeList.add(cashLesskey);
							deliveryChargesHM 		= paymentTypeHM.get(cashLesskey);
						} else
							deliveryChargesHM 		= paymentTypeHM.get(payKey);

						if(deliveryChargesHM == null) {
							deliveryChargesHM 	= new LinkedHashMap<>();

							var	reportDataModel	= new DeliveryCashChequeStatementReportModel();
							reportDataModel.setBookingTotal(element.getBookingTotal());

							createReportModelForBookingTotalDTO(reportDataModel, element);

							chargesList.add(DeliveryCashChequeStatementReportModel.BOOKING_AMOUNT_KEY);
							deliveryChargesHM.put(DeliveryCashChequeStatementReportModel.BOOKING_AMOUNT_KEY, reportDataModel);

							if(wayBillCharges != null)
								for (final WayBillCharges wayBillCharge : wayBillCharges) {
									reportDataModel	= new DeliveryCashChequeStatementReportModel();

									createReportModelForChargesTotalDTO(element, wayBillCharge, reportDataModel);

									if(!chargesList.contains(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName()))
										chargesList.add(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName());

									deliveryChargesHM.put(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName(), reportDataModel);
								}

							if(PaymentTypeConstant.getBankPaymentList().contains(element.getPaymentTypeId()))
								paymentTypeHM.put(cashLesskey, deliveryChargesHM);
							else
								paymentTypeHM.put(payKey, deliveryChargesHM);
						} else {
							var	reportDataModel		= deliveryChargesHM.get(DeliveryCashChequeStatementReportModel.BOOKING_AMOUNT_KEY);

							if(reportDataModel == null)
								reportDataModel	= new DeliveryCashChequeStatementReportModel();

							createReportModelForBookingTotalDTO(reportDataModel, element);

							deliveryChargesHM.put(DeliveryCashChequeStatementReportModel.BOOKING_AMOUNT_KEY, reportDataModel);

							if(wayBillCharges != null)
								for (final WayBillCharges wayBillCharge : wayBillCharges) {
									reportDataModel		= deliveryChargesHM.get(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName());

									if(reportDataModel == null)
										reportDataModel	= new DeliveryCashChequeStatementReportModel();

									createReportModelForChargesTotalDTO(element, wayBillCharge, reportDataModel);

									if(!chargesList.contains(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName()))
										chargesList.add(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName());

									deliveryChargesHM.put(wayBillCharge.getWayBillChargeMasterId() + "_" + wayBillCharge.getName(), reportDataModel);
								}
						}
					}

					final var	dateToCreateDataModel 	= sdf.format(element.getDeliveryDateTime());
					var	model 					= dateWiseDataModel.get(dateToCreateDataModel);

					if(model == null) {
						model = new DeliveryCashChequeStatementReportModel();

						model.setDeliveryDateTime(element.getDeliveryDateTime());
						model.setTotalNoOfCR((short)1);
						model.setTotalNoOfLR((short)1);
						model.setFormTypeName(element.getFormTypeName());

						if(StringUtils.isNotEmpty(element.getChequeNumber()))
							model.setTotalNoOfCheque((short)1);

						model.setTotalNoOfDDM((short)0);
						model.setTotalQuantity(element.getQuantity());
						model.setTotalActualWeight(element.getActualWeight());
						model.setTotalChargesCollection(element.getChargesCollection());

						if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							model.setTotalPaidAmount(element.getGrandTotal());
							model.setTotalBookingPaidAmount(model.getTotalBookingPaidAmount() + element.getBookingTotal());
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							model.setTotalTopayAmount(element.getGrandTotal() - (element.getDeliveryAmount() - element.getDeliveryDiscount()));
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							model.setTotalTbbBookingAmount(model.getTotalTbbBookingAmount() + element.getBookingTotal());

						model.setServiceTaxAmount(element.getServiceTaxAmount());
						model.setTotalDiscount(element.getDeliveryDiscount());

						if(wbIdWiseTDSAmt != null && wbIdWiseTDSAmt.get(element.getWayBillId()) != null) {
							model.setTdsAmount(tdsAmt);
							model.setTotalAmount(element.getGrandTotal() - tdsAmt);
						} else
							model.setTotalAmount(element.getGrandTotal());

					    model.addPaymentAmount(element.getPaymentTypeId(), element.getGrandTotal());

						dateWiseDataModel.put(dateToCreateDataModel, model);
					} else {
						model.setTotalNoOfCR((short) (model.getTotalNoOfCR() + 1));
						model.setTotalNoOfLR((short) (model.getTotalNoOfLR() + 1));

						if(StringUtils.isNotEmpty(element.getChequeNumber()))
							model.setTotalNoOfCheque((short) (model.getTotalNoOfCheque() + 1));

						model.setTotalNoOfDDM((short) (model.getTotalNoOfDDM() + 0));
						model.setTotalQuantity(model.getTotalQuantity() + element.getQuantity());
						model.setTotalActualWeight(model.getTotalActualWeight() + element.getActualWeight());

						chargeCollection		= element.getChargesCollection();
						final var	storedChargeCollection 	= model.getTotalChargesCollection();

						for(final Map.Entry<Long, Double> entry : storedChargeCollection.entrySet()) {
							var amt = 0.00;

							if(chargeCollection != null && chargeCollection.get(entry.getKey()) != null)
								amt = chargeCollection.get(entry.getKey());

							storedChargeCollection.put(entry.getKey(), entry.getValue() + amt);
						}

						model.setTotalChargesCollection(storedChargeCollection);

						if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							model.setTotalPaidAmount(model.getTotalPaidAmount() + element.getGrandTotal());
							model.setTotalBookingPaidAmount(model.getTotalBookingPaidAmount() + element.getBookingTotal());
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
							model.setTotalTopayAmount(model.getTotalTopayAmount() + (element.getGrandTotal() - (element.getDeliveryAmount() - element.getDeliveryDiscount())));
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							model.setTotalTbbBookingAmount(model.getTotalTbbBookingAmount() + element.getBookingTotal());

						if(wbIdWiseTDSAmt != null && wbIdWiseTDSAmt.get(element.getWayBillId()) != null) {
							model.setTdsAmount(model.getTdsAmount() + tdsAmt);
							model.setTotalAmount(model.getTotalAmount() + element.getGrandTotal() - tdsAmt);
						} else
							model.setTotalAmount(model.getTotalAmount() + element.getGrandTotal());

						model.setServiceTaxAmount(model.getServiceTaxAmount() + element.getServiceTaxAmount());
						model.setTotalDiscount(model.getTotalDiscount() + element.getDeliveryDiscount());
					    model.addPaymentAmount(element.getPaymentTypeId(), element.getGrandTotal());
					}


					if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
						discountModel.setBillCreditAmount(discountModel.getBillCreditAmount() + element.getDeliveryDiscount());
					else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
						discountModel.setCashAmount(discountModel.getCashAmount() + element.getDeliveryDiscount());
					else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
						discountModel.setShortCreditAmount(discountModel.getShortCreditAmount() + element.getDeliveryDiscount());
					else if(PaymentTypeConstant.getBankPaymentList().contains(element.getPaymentTypeId()))
						discountModel.setCashLessAmount(discountModel.getCashLessAmount() + element.getDeliveryDiscount());

					if(paymentTypeColl.get(element.getPaymentTypeId()) != null)
						paymentTypeColl.put(element.getPaymentTypeId(), paymentTypeColl.get(element.getPaymentTypeId()) + element.getGrandTotal());
					else
						paymentTypeColl.put(element.getPaymentTypeId(), element.getGrandTotal());
				}

				request.setAttribute("dateWiseDataModel", dateWiseDataModel);
				request.setAttribute("finalWayBillNumberList", finalCRumberList);
				request.setAttribute("showPaymentWiseTable", showPaymentWiseTable);
				request.setAttribute("paymentTypeList", paymentTypeList);
				request.setAttribute("chargesList", chargesList);
				request.setAttribute("receivedAmount", receivedAmount - cancelAmount);
				request.setAttribute("discountModel", discountModel);
				request.setAttribute("paymentTypeColl", paymentTypeColl);
				request.setAttribute(AliasNameConstants.TOTAL_TDS_AMOUNT, totalTDSAmt);
				request.setAttribute("paymentTypeHM", paymentTypeHM);
				request.setAttribute("showPendingStockDetailsTable", showPendingStockDetailsTable);
				request.setAttribute("totalDiscountAmount", totalDiscountAmount);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void createReportModelForBookingTotalDTO(final DeliveryCashChequeStatementReportModel	model, final DeliveryCashChequeStatementReport reportModel) throws Exception {
		try {
			if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID
					|| reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
				if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
					model.setBillCreditAmount(model.getBillCreditAmount() + reportModel.getBookingTotal());
				else if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
					model.setCashAmount(model.getCashAmount() + reportModel.getBookingTotal());
				else if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
					model.setShortCreditAmount(model.getShortCreditAmount() + reportModel.getBookingTotal());
				else if(PaymentTypeConstant.getBankPaymentList().contains(reportModel.getPaymentTypeId()))
					model.setCashLessAmount(model.getCashLessAmount() + reportModel.getBookingTotal());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void createReportModelForChargesTotalDTO(final DeliveryCashChequeStatementReport reportModel, final WayBillCharges wayBillCharges,
			final DeliveryCashChequeStatementReportModel model) throws Exception {

		try {
			if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
				model.setBillCreditAmount(model.getBillCreditAmount() + wayBillCharges.getChargeAmount());
			else if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
				model.setCashAmount(model.getCashAmount() + wayBillCharges.getChargeAmount());
			else if(reportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
				model.setShortCreditAmount(model.getShortCreditAmount() + wayBillCharges.getChargeAmount());
			else if(PaymentTypeConstant.getBankPaymentList().contains(reportModel.getPaymentTypeId()))
				model.setCashLessAmount(model.getCashLessAmount() + wayBillCharges.getChargeAmount());
		}catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private GodownStockReportForPendingDeliveryModel getFinalGdwnStockRprtForPendinDelivery(final List<GodownStockReportForPendingDeliveryModel> gdwnStockRprtForPendinDeliveryArr) throws Exception {
		try {
			final var	pendModel	= new GodownStockReportForPendingDeliveryModel();

			pendModel.setTotalLRs(gdwnStockRprtForPendinDeliveryArr.stream().count());
			pendModel.setTotalQuantity(gdwnStockRprtForPendinDeliveryArr.stream().mapToLong(GodownStockReportForPendingDeliveryModel::getQuantity).sum());
			pendModel.setTotalWeight(gdwnStockRprtForPendinDeliveryArr.stream().mapToDouble(GodownStockReportForPendingDeliveryModel::getActualWeight).sum());
			pendModel.setTotalToPayAmount(gdwnStockRprtForPendinDeliveryArr.stream().filter(a -> a.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY).mapToDouble(GodownStockReportForPendingDeliveryModel::getBookingAmount).sum());
			pendModel.setTotalDeclaredValue(gdwnStockRprtForPendinDeliveryArr.stream().mapToDouble(GodownStockReportForPendingDeliveryModel::getDeclaredValue).sum());

			return pendModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}