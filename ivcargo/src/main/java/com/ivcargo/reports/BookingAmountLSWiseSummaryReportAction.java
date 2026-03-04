package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.BookingAmountLSWiseSummaryDao;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.report.account.BookingAmountLSWiseSummaryConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.model.BookingAmountLSWiseSummaryModel;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BookingAmountLSWiseSummaryReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		LinkedHashMap<Long,DispatchLedger>				dispatchLedgerColl					= null;
		HashMap<Long,DeliveryContactDetails>			delConColl							= null;
		HashMap<Long,ConsignmentSummary>				consSummcoll						= null;
		HashMap<Long,CreditWayBillTxn>					creditWBBookingTxnColl				= null;
		HashMap<Long,CreditWayBillTxn>					creditWBDeliveryTxnColl				= null;
		HashMap<Long,WayBill>							wayBillList							= null;
		var												typeOfLSString				= "";

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingAmountLSWiseSummaryReportAction().execute(request, response);

			final var	fromDate		= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate			= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			final var	cache 	        = new CacheManip(request);
			final var	executive       = cache.getExecutive(request);

			final var	configuration			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_AMOUNT_LS_WISE_SUMMARY_REPORT, executive.getAccountGroupId());

			final var	showTbbDataInReports	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TBB_DATA_IN_REPORTS);
			final var	allowDeliveryTotal		= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.ALLOW_DELIVERY_TOTAL);

			final var	typeOfLs = JSPUtility.GetShort(request, "typeOfLs",(short) 0);

			if(typeOfLs == 0)
				typeOfLSString = DispatchLedger.TYPE_OF_LS_ID_NORMAL+","+DispatchLedger.TYPE_OF_LS_ID_DDM+","+DispatchLedger.TYPE_OF_LS_ID_Inter_Branch;
			else
				typeOfLSString = typeOfLs+"";

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			final var	branchIds	= ActionStaticUtil.getPhysicalBranchIds(request, cache, executive);

			final var	wayBillTypeIds = showTbbDataInReports ? "1,2,4" : "1,2";

			final var	objectOut = BookingAmountLSWiseSummaryDao.getInstance().getBookingAmountLSWiseSummary(branchIds, executive.getAccountGroupId(), fromDate, toDate,typeOfLSString, wayBillTypeIds);

			if(objectOut != null) {
				final var	dispatchLedgerIdArr = (Long[])objectOut.get("dispatchLedgerIdArr");

				if(dispatchLedgerIdArr != null && Utility.GetLongArrayToString(dispatchLedgerIdArr) != null)
					dispatchLedgerColl = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(Utility.GetLongArrayToString(dispatchLedgerIdArr));

				final var	wayBillIdArr = (Long[])objectOut.get("wayBillIdArr");

				if(wayBillIdArr != null && Utility.GetLongArrayToString(wayBillIdArr) != null && Utility.GetLongArrayToString(wayBillIdArr).length() > 0)
					wayBillList	= WayBillDao.getInstance().getLimitedLRDetails(Utility.GetLongArrayToString(wayBillIdArr));

				final var 	wayBillBookingchargesHM	= WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(Utility.GetLongArrayToString(wayBillIdArr));

				final var	paidWayBillIdArr = (Long[])objectOut.get("paidWayBillIdArr");

				if(paidWayBillIdArr != null && Utility.GetLongArrayToString(paidWayBillIdArr) != null && Utility.GetLongArrayToString(paidWayBillIdArr).length() > 0) {
					consSummcoll = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(Utility.GetLongArrayToString(paidWayBillIdArr));
					creditWBBookingTxnColl = CreditWayBillTxnDAO.getInstance().getClearedWBDetailsByWBIds(Utility.GetLongArrayToString(paidWayBillIdArr), CreditWayBillTxn.TXN_TYPE_BOOKING_ID);
				}

				final var	topayWayBillIdArr = (Long[])objectOut.get("topayWayBillIdArr");

				if(topayWayBillIdArr != null && Utility.GetLongArrayToString(topayWayBillIdArr) != null && Utility.GetLongArrayToString(topayWayBillIdArr).length() > 0) {
					delConColl = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForBLHPV(Utility.GetLongArrayToString(topayWayBillIdArr));
					creditWBDeliveryTxnColl = CreditWayBillTxnDAO.getInstance().getClearedWBDetailsByWBIds(Utility.GetLongArrayToString(topayWayBillIdArr), CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);
				}

				final var	bookingAmountLSWiseSummaryModelColl = (HashMap<Long,BookingAmountLSWiseSummaryModel>) objectOut.get("bookingAmountLSWiseSummaryModelColl");

				for(final Long key : bookingAmountLSWiseSummaryModelColl.keySet()) {
					final var	bookingAmountLSWiseSummaryModel = bookingAmountLSWiseSummaryModelColl.get(key);

					if(dispatchLedgerColl != null && dispatchLedgerColl.get(bookingAmountLSWiseSummaryModel.getDispatchLedgerId()) != null) {
						final var	dispatchLedger = dispatchLedgerColl.get(bookingAmountLSWiseSummaryModel.getDispatchLedgerId());
						bookingAmountLSWiseSummaryModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
						bookingAmountLSWiseSummaryModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
						bookingAmountLSWiseSummaryModel.setVehicleNumber(dispatchLedger.getVehicleNumber());
						bookingAmountLSWiseSummaryModel.setSourceBranch(cache.getGenericBranchDetailCache(request, bookingAmountLSWiseSummaryModel.getSourceBranchId()).getName());
						bookingAmountLSWiseSummaryModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, bookingAmountLSWiseSummaryModel.getDestinationBranchId()).getName());
					}

					final var	bookingAmountLRWiseSummaryModelColl = bookingAmountLSWiseSummaryModel.getBookingAmountLRWiseSummaryModel();

					for(final Long key1 : bookingAmountLRWiseSummaryModelColl.keySet()) {
						short	paymentType				= 0;
						var	grandTotal				= 0.00;
						var	totalFreightAmount		= 0.0;
						var	totalOctroiAmount		= 0.0;
						var	totalCartingAmount		= 0.0;

						final var	bookingAmountLRWiseSummaryModel	= bookingAmountLRWiseSummaryModelColl.get(key1);
						final var	chargeWiseHM					= wayBillBookingchargesHM.get(key1);

						if(chargeWiseHM != null && chargeWiseHM.size() > 0)
							for(final Long chargeId : chargeWiseHM.keySet()) {
								if(chargeId == BookingChargeConstant.FREIGHT)
									totalFreightAmount += chargeWiseHM.get(chargeId).getChargeAmount();

								if(chargeId == BookingChargeConstant.OCTROI_BOOKING)
									totalOctroiAmount += chargeWiseHM.get(chargeId).getChargeAmount();

								if(chargeId == BookingChargeConstant.CARTING_CHARGE)
									totalCartingAmount += chargeWiseHM.get(chargeId).getChargeAmount();
							}

						bookingAmountLRWiseSummaryModel.setTotalFreightAmount(totalFreightAmount);
						bookingAmountLRWiseSummaryModel.setTotalOctroiAmount(totalOctroiAmount);
						bookingAmountLRWiseSummaryModel.setTotalCartingAmount(totalCartingAmount);

						if(wayBillList != null && wayBillList.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							final var	wayBill = wayBillList.get(bookingAmountLRWiseSummaryModel.getWayBillId());

							if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
								bookingAmountLRWiseSummaryModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
						}

						if(consSummcoll != null && consSummcoll.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							final var	consignmentSummary = consSummcoll.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setPaymentType(consignmentSummary.getPaymentType());
						}

						if(delConColl != null && delConColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							final var	deliveryContactDetails = delConColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setPaymentType(deliveryContactDetails.getPaymentType());
						}

						if(bookingAmountLRWiseSummaryModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID || PaymentTypeConstant.getBankPaymentList().contains(bookingAmountLRWiseSummaryModel.getPaymentType())) {
							paymentType = bookingAmountLRWiseSummaryModel.getPaymentType();
							grandTotal	= bookingAmountLRWiseSummaryModel.getGrandTotal();
						} else if(bookingAmountLRWiseSummaryModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
							if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(creditWBBookingTxnColl != null && creditWBBookingTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
									final var	creditWayBillTxn = creditWBBookingTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
									paymentType = creditWayBillTxn.getPaymentType();
									grandTotal	= creditWayBillTxn.getReceivedAmount();
								}
							} else if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && creditWBDeliveryTxnColl != null && creditWBDeliveryTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
								final var	creditWayBillTxn = creditWBDeliveryTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
								paymentType = creditWayBillTxn.getPaymentType();
								grandTotal	= creditWayBillTxn.getReceivedAmount();
							}

						if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								bookingAmountLSWiseSummaryModel.setPaidCashAmount(bookingAmountLSWiseSummaryModel.getPaidCashAmount() + grandTotal);
							else if(PaymentTypeConstant.getBankPaymentList().contains(paymentType))
								bookingAmountLSWiseSummaryModel.setPaidChequeAmount(bookingAmountLSWiseSummaryModel.getPaidChequeAmount() + grandTotal);
						} else if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
								if(allowDeliveryTotal)
									bookingAmountLSWiseSummaryModel.setTopayCashAmount(bookingAmountLSWiseSummaryModel.getTopayCashAmount() + bookingAmountLRWiseSummaryModel.getDeliveryTotal());
								else
									bookingAmountLSWiseSummaryModel.setTopayCashAmount(bookingAmountLSWiseSummaryModel.getTopayCashAmount() + grandTotal);
							} else if(PaymentTypeConstant.getBankPaymentList().contains(paymentType))
								if(allowDeliveryTotal)
									bookingAmountLSWiseSummaryModel.setTopayChequeAmount(bookingAmountLSWiseSummaryModel.getTopayChequeAmount() + bookingAmountLRWiseSummaryModel.getDeliveryTotal() + bookingAmountLRWiseSummaryModel.getDeliveryDiscount());
								else
									bookingAmountLSWiseSummaryModel.setTopayChequeAmount(bookingAmountLSWiseSummaryModel.getTopayChequeAmount() + grandTotal);
						}else if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
								&& bookingAmountLRWiseSummaryModel.getBillId() > 0)
							bookingAmountLSWiseSummaryModel.setTbbAmont(bookingAmountLSWiseSummaryModel.getTbbAmont() + bookingAmountLRWiseSummaryModel.getGrandTotal());

						bookingAmountLSWiseSummaryModel.setTotalFreightAmount(bookingAmountLSWiseSummaryModel.getTotalFreightAmount() + bookingAmountLRWiseSummaryModel.getTotalFreightAmount());
						bookingAmountLSWiseSummaryModel.setTotalOctroiAmount(bookingAmountLSWiseSummaryModel.getTotalOctroiAmount() + bookingAmountLRWiseSummaryModel.getTotalOctroiAmount());
						bookingAmountLSWiseSummaryModel.setTotalCartingAmount(bookingAmountLSWiseSummaryModel.getTotalCartingAmount() + bookingAmountLRWiseSummaryModel.getTotalCartingAmount());

						bookingAmountLSWiseSummaryModel.setTotalAmount(
								bookingAmountLSWiseSummaryModel.getPaidCashAmount()
								+ bookingAmountLSWiseSummaryModel.getPaidChequeAmount()
								+ bookingAmountLSWiseSummaryModel.getTopayCashAmount()
								+ bookingAmountLSWiseSummaryModel.getTopayChequeAmount()
								+ bookingAmountLSWiseSummaryModel.getTbbAmont()
								);
					}
				}

				request.setAttribute("bookingAmountLSWiseSummaryModelColl",objectOut.get("bookingAmountLSWiseSummaryModelColl"));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
