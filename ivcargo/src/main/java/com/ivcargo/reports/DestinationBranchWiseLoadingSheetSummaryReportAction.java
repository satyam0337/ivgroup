package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.DestinationBranchWiseBookingSummaryDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.LSBookingRegisterReport;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DestinationBranchWiseLoadingSheetSummaryReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		SimpleDateFormat		sdf					= null;
		Timestamp				fromDate			= null;
		Timestamp				toDate				= null;
		ValueObject				objectIn 			= null;
		ValueObject				valueObject			= null;
		CacheManip				cache				= null;
		String					branchIds			= null;
		ChargeTypeModel[]		bookingCharges  	= null;
		Long[]					wayBillIdArr		= null;
		WayBill					wayBill				= null;
		ArrayList<Long>   		wayBillIdList		= null;
		HashMap<Long, WayBill> 	lrColl  			= null;
		WayBillCharges[]		wayBillCharges		= null;
		HashMap<Long, ArrayList<Long>>			dispatchHM				= null;
		LSBookingRegisterReport					reportModel				= null;
		Map<Long, LSBookingRegisterReport>		lsBookingHM	 			= null;
		HashMap<Long, Double>                   chargeCollection		= null;
		HashMap<Long, WayBillDeatailsModel> 	wayBillDetails 			= null;
		double	grandTotal		= 0.00;
		double	discountTotal	= 0.00;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDestinationBranchWiseLoadingSheetSummaryReportAction().execute(request, response);

			sdf						 = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			cache       			 = new CacheManip(request);
			executive				 = cache.getExecutive(request);
			fromDate				 = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate					 = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn				 = new ValueObject();
			final long regionId			 = JSPUtility.GetLong(request, "regions" ,0);
			final long subRegionId		 = JSPUtility.GetLong(request, "subRegions" ,0);
			final long destinationBranchId = JSPUtility.GetLong(request, "destinationBranchId" ,0);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);

			request.setAttribute("regionId", regionId);
			request.setAttribute("subRegionId", subRegionId);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchIds", branchIds);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("destinationBranchId", destinationBranchId);

			lsBookingHM = DestinationBranchWiseBookingSummaryDAO.getInstance().getDispatchDataByDestinationBranchAndSourceBranchId(objectIn);

			if(lsBookingHM != null && lsBookingHM.size() > 0) {
				valueObject	   = DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(lsBookingHM.values().stream().map(e -> e.getDispatchLedgerId() + "").collect(Collectors.joining(",")));
				dispatchHM	   = (HashMap<Long, ArrayList<Long>>) valueObject.get("dispachLedgerWithWaybillids");
				wayBillIdList  = (ArrayList<Long>) valueObject.get("waybillIdsForCreatingString");

				if(wayBillIdList != null && !wayBillIdList.isEmpty()) {

					wayBillIdArr	 = new Long[wayBillIdList.size()];
					lrColl			 = WayBillDao.getInstance().getLimitedLRDetails(Utility.GetLongArrayListToString(wayBillIdList));
					bookingCharges 	 = cache.getBookingCharges(request, executive.getBranchId());
					wayBillDetails 	 = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdList.toArray(wayBillIdArr) ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,(short)0 ,false);

					for(final Map.Entry<Long, LSBookingRegisterReport> entry : lsBookingHM.entrySet()) {
						chargeCollection = new HashMap<Long, Double>();
						reportModel      = entry.getValue();
						wayBillIdList    = dispatchHM.get(entry.getKey());

						if(reportModel.getLsNumber() == null)
							reportModel.setLsNumber(reportModel.getDispatchLedgerId() + "");

						if(wayBillIdList != null)
							for (final Long element : wayBillIdList) {
								grandTotal    = 0.00;
								discountTotal = 0.00;
								wayBill 		= lrColl.get(element);
								grandTotal  	= wayBill.getBookingTotal();
								discountTotal 	= wayBill.getBookingDiscount();
								wayBillCharges 	= wayBillDetails.get(wayBill.getWayBillId()).getWayBillCharges();

								for (final WayBillCharges wayBillCharge : wayBillCharges) {
									if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT) {
										if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
											reportModel.setPaidTotal(reportModel.getPaidTotal() + wayBillCharge.getChargeAmount());
										else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
											reportModel.setTopayTotal(reportModel.getTopayTotal() + wayBillCharge.getChargeAmount());
										else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
											reportModel.setCreditTotal(reportModel.getCreditTotal() + wayBillCharge.getChargeAmount());
									} else if(chargeCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargeCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

									reportModel.setChargeCollection(chargeCollection);
								}

								reportModel.setSourceBranch(cache.getGenericBranchDetailCache(request, reportModel.getSourceBranchId()).getName());
								reportModel.setTotalAmount(grandTotal + reportModel.getTotalAmount());
								reportModel.setDiscountTotal(discountTotal + reportModel.getDiscountTotal());
							}
					}

					request.setAttribute("bookingCharges", bookingCharges);
					request.setAttribute("lsBookingHM", lsBookingHM);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			executive			= null;
			sdf					= null;
			fromDate			= null;
			toDate				= null;
			objectIn 			= null;
			valueObject			= null;
			cache				= null;
			branchIds			= null;
			bookingCharges  	= null;
			wayBillIdArr		= null;
			wayBill				= null;
			wayBillIdList		= null;
			lrColl  			= null;
			wayBillCharges		= null;
			dispatchHM				= null;
			reportModel				= null;
			lsBookingHM	 			= null;
			chargeCollection		= null;
			wayBillDetails 			= null;
		}
	}
}
