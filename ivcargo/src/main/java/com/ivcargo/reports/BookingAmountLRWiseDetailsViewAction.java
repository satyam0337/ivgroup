package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.BookingAmountLSWiseSummaryDao;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.WayBill;
import com.platform.dto.model.BookingAmountLRWiseSummaryModel;
import com.platform.dto.model.BookingAmountLSWiseSummaryModel;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BookingAmountLRWiseDetailsViewAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		CacheManip				cache 	        		= null;
		ValueObject				objectOut 				= null;
		ReportViewModel			reportViewModel 		= null;
		Long[]					dispatchLedgerIdArr		= null;
		Long[]					paidWayBillIdArr		= null;
		Long[]					wayBillIdArr			= null;
		Long[]					topayWayBillIdArr		= null;
		CreditWayBillTxn		creditWayBillTxn		= null;
		DispatchLedger			dispatchLedger			= null;
		ConsignmentSummary		consignmentSummary		= null;
		DeliveryContactDetails	deliveryContactDetails	= null;
		CustomerDetails			customerDetails			= null;
		WayBill					wayBill					= null;
		LinkedHashMap<Long,DispatchLedger>				dispatchLedgerColl					= null;
		HashMap<Long,BookingAmountLSWiseSummaryModel>	bookingAmountLSWiseSummaryModelColl = null;
		HashMap<Long,BookingAmountLRWiseSummaryModel>	bookingAmountLRWiseSummaryModelColl = null;
		BookingAmountLSWiseSummaryModel					bookingAmountLSWiseSummaryModel		= null;
		HashMap<Long,DeliveryContactDetails>			delConColl							= null;
		HashMap<Long,ConsignmentSummary>				consSummcoll						= null;
		BookingAmountLRWiseSummaryModel					bookingAmountLRWiseSummaryModel		= null;
		HashMap<Long,CreditWayBillTxn>					creditWBBookingTxnColl				= null;
		HashMap<Long,CreditWayBillTxn>					creditWBDeliveryTxnColl				= null;
		HashMap<Long,CustomerDetails>					consignorList						= null;
		HashMap<Long,CustomerDetails>					consigneeList						= null;
		HashMap<Long,WayBill>							wayBillList							= null;
		short											paymentType							= 0;
		var											grandTotal							= 0.00;
		var 											dispatchLedgerId					= 0L;
		var											showTbbDataInReports 				= false;
		String											wayBillTypeIds						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			dispatchLedgerId	= JSPUtility.GetLong(request, "dispatchLedgerId", 0);
			showTbbDataInReports	= JSPUtility.GetBoolean(request, "showTbbDataInReports", false);

			cache				= new CacheManip(request);
			if(showTbbDataInReports)
				wayBillTypeIds = "1,2,4";
			else
				wayBillTypeIds = "1,2";

			objectOut = BookingAmountLSWiseSummaryDao.getInstance().getBookingAmountLSWiseSummaryByLSId(dispatchLedgerId,wayBillTypeIds);


			if(objectOut != null) {

				dispatchLedgerIdArr = (Long[])objectOut.get("dispatchLedgerIdArr");
				if(dispatchLedgerIdArr != null && Utility.GetLongArrayToString(dispatchLedgerIdArr) != null)
					dispatchLedgerColl = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(Utility.GetLongArrayToString(dispatchLedgerIdArr));

				wayBillIdArr = (Long[])objectOut.get("wayBillIdArr");
				if(wayBillIdArr != null && Utility.GetLongArrayToString(wayBillIdArr) != null && Utility.GetLongArrayToString(wayBillIdArr).length() > 0) {
					consignorList	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(Utility.GetLongArrayToString(wayBillIdArr));
					consigneeList	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(Utility.GetLongArrayToString(wayBillIdArr));
					wayBillList		= WayBillDao.getInstance().getLimitedLRDetails(Utility.GetLongArrayToString(wayBillIdArr));
				}

				paidWayBillIdArr = (Long[])objectOut.get("paidWayBillIdArr");
				if(paidWayBillIdArr != null && Utility.GetLongArrayToString(paidWayBillIdArr) != null && Utility.GetLongArrayToString(paidWayBillIdArr).length() > 0) {
					consSummcoll = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(Utility.GetLongArrayToString(paidWayBillIdArr));
					creditWBBookingTxnColl = CreditWayBillTxnDAO.getInstance().getClearedWBDetailsByWBIds(Utility.GetLongArrayToString(paidWayBillIdArr), CreditWayBillTxn.TXN_TYPE_BOOKING_ID);
				}

				topayWayBillIdArr = (Long[])objectOut.get("topayWayBillIdArr");
				if(topayWayBillIdArr != null && Utility.GetLongArrayToString(topayWayBillIdArr) != null && Utility.GetLongArrayToString(topayWayBillIdArr).length() > 0) {
					delConColl = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForBLHPV(Utility.GetLongArrayToString(topayWayBillIdArr));
					creditWBDeliveryTxnColl = CreditWayBillTxnDAO.getInstance().getClearedWBDetailsByWBIds(Utility.GetLongArrayToString(topayWayBillIdArr), CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);
				}


				bookingAmountLSWiseSummaryModelColl = (HashMap<Long,BookingAmountLSWiseSummaryModel>) objectOut.get("bookingAmountLSWiseSummaryModelColl");

				for(final Long key : bookingAmountLSWiseSummaryModelColl.keySet()) {

					bookingAmountLSWiseSummaryModel = bookingAmountLSWiseSummaryModelColl.get(key);

					if(dispatchLedgerColl != null && dispatchLedgerColl.get(bookingAmountLSWiseSummaryModel.getDispatchLedgerId()) != null) {
						dispatchLedger = dispatchLedgerColl.get(bookingAmountLSWiseSummaryModel.getDispatchLedgerId());
						bookingAmountLSWiseSummaryModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
						bookingAmountLSWiseSummaryModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
						bookingAmountLSWiseSummaryModel.setVehicleNumber(dispatchLedger.getVehicleNumber());
						bookingAmountLSWiseSummaryModel.setSourceBranch(cache.getGenericBranchDetailCache(request, bookingAmountLSWiseSummaryModel.getSourceBranchId()).getName());
						bookingAmountLSWiseSummaryModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, bookingAmountLSWiseSummaryModel.getDestinationBranchId()).getName());
					}

					bookingAmountLRWiseSummaryModelColl = bookingAmountLSWiseSummaryModel.getBookingAmountLRWiseSummaryModel();

					for(final Long key1 : bookingAmountLRWiseSummaryModelColl.keySet()) {

						paymentType	= 0;
						grandTotal	= 0.00;
						creditWayBillTxn = null;
						bookingAmountLRWiseSummaryModel	= bookingAmountLRWiseSummaryModelColl.get(key1);
						bookingAmountLRWiseSummaryModel.setSourceBranch(cache.getGenericBranchDetailCache(request, bookingAmountLRWiseSummaryModel.getSourceBranchId()).getName());
						bookingAmountLRWiseSummaryModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, bookingAmountLRWiseSummaryModel.getDestinationBranchId()).getName());

						if(wayBillList != null && wayBillList.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							wayBill = wayBillList.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
								bookingAmountLRWiseSummaryModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
						}

						if(consignorList != null && consignorList.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							customerDetails = consignorList.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setConsignorName(customerDetails.getName());
						}

						if(consigneeList != null && consigneeList.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							customerDetails = consigneeList.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setConsigneeName(customerDetails.getName());
						}

						if(consSummcoll != null && consSummcoll.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							consignmentSummary = consSummcoll.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setPaymentType(consignmentSummary.getPaymentType());
						}

						if(delConColl != null && delConColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
							deliveryContactDetails = delConColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
							bookingAmountLRWiseSummaryModel.setPaymentType(deliveryContactDetails.getPaymentType());
						}

						if((bookingAmountLRWiseSummaryModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) || PaymentTypeConstant.getBankPaymentList().contains(bookingAmountLRWiseSummaryModel.getPaymentType())) {
							paymentType = bookingAmountLRWiseSummaryModel.getPaymentType();
							grandTotal	= bookingAmountLRWiseSummaryModel.getGrandTotal() - bookingAmountLRWiseSummaryModel.getDeliveryDiscount();
						} else if(bookingAmountLRWiseSummaryModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
							if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(creditWBBookingTxnColl != null && creditWBBookingTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null) {
									creditWayBillTxn = creditWBBookingTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
									paymentType = creditWayBillTxn.getPaymentType();
									grandTotal	= creditWayBillTxn.getReceivedAmount();
								}
							} else if((bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) && (creditWBDeliveryTxnColl != null && creditWBDeliveryTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId()) != null)) {
								creditWayBillTxn = creditWBDeliveryTxnColl.get(bookingAmountLRWiseSummaryModel.getWayBillId());
								paymentType = creditWayBillTxn.getPaymentType();
								grandTotal	= creditWayBillTxn.getReceivedAmount();
							}

						if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								bookingAmountLSWiseSummaryModel.setPaidCashAmount(bookingAmountLSWiseSummaryModel.getPaidCashAmount() + grandTotal);
							else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								bookingAmountLSWiseSummaryModel.setPaidChequeAmount(bookingAmountLSWiseSummaryModel.getPaidChequeAmount() + grandTotal);
						} else if(bookingAmountLRWiseSummaryModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								bookingAmountLSWiseSummaryModel.setTopayCashAmount(bookingAmountLSWiseSummaryModel.getTopayCashAmount() + grandTotal);
							else if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								bookingAmountLSWiseSummaryModel.setTopayChequeAmount(bookingAmountLSWiseSummaryModel.getTopayChequeAmount() + grandTotal);

						bookingAmountLRWiseSummaryModel.setReceivedAmount(grandTotal);

						bookingAmountLSWiseSummaryModel.setTotalAmount(
								bookingAmountLSWiseSummaryModel.getPaidCashAmount()
								+ bookingAmountLSWiseSummaryModel.getPaidChequeAmount()
								+ bookingAmountLSWiseSummaryModel.getTopayCashAmount()
								+ bookingAmountLSWiseSummaryModel.getTopayChequeAmount()
								);
					}
				}

				request.setAttribute("bookingAmountLSWiseSummaryModelColl",objectOut.get("bookingAmountLSWiseSummaryModelColl"));

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
