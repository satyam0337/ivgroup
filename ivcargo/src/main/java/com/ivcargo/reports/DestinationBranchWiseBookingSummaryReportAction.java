package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.DestinationBranchWiseBookingSummaryDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DestinationBranchWiseBookingSummaryReport;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DestinationBranchWiseBookingSummaryReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		SimpleDateFormat		sdf					= null;
		Timestamp				fromDate			= null;
		Timestamp				toDate				= null;
		ValueObject				objectIn 			= null;
		CacheManip				cache				= null;
		String					wayBillIds			= null;
		String					branchIds			= null;
		ChargeTypeModel[]		bookingCharges  	= null;
		Long[]					wayBillIdArr		= null;
		WayBill					wayBill				= null;
		String			 		dispatchIds			= null;
		ArrayList<Long>   		wayBillIdList		= null;
		HashMap<Long, Long>     conSummaryHM		= null;
		HashMap<Long, WayBill> 	lrColl  			= null;
		WayBillCharges[]		wayBillCharges		= null;
		HashMap<Long, Double>                   					chargeCollection			= null;
		HashMap<Long, WayBillDeatailsModel> 						wayBillDetails 				= null;
		DestinationBranchWiseBookingSummaryReport 					reportModel					= null;
		SortedMap<Long, DestinationBranchWiseBookingSummaryReport>  categoryTypeWiseHM  		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDestinationBranchWiseBookingSummaryReportAction().execute(request, response);

			sdf						 = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			cache       			 = new CacheManip(request);
			executive				 = (Executive) request.getSession().getAttribute("executive");
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

			dispatchIds = DestinationBranchWiseBookingSummaryDAO.getInstance().getDispatchDataByDestinationBranchId(objectIn);

			if(dispatchIds != null){
				wayBillIdList = DispatchSummaryDao.getInstance().getWayBillIdsByDispatchLedgerIds(dispatchIds);

				if(wayBillIdList != null && wayBillIdList.size() > 0){

					categoryTypeWiseHM 		 = new TreeMap<Long, DestinationBranchWiseBookingSummaryReport>();
					wayBillIdArr	 		 = new Long[wayBillIdList.size()];
					wayBillIdList.toArray(wayBillIdArr);
					wayBillIds 		 = Utility.GetLongArrayListToString(wayBillIdList);
					bookingCharges 	 = cache.getBookingCharges(request, executive.getBranchId());

					lrColl			  = WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);
					conSummaryHM	  = ConsignmentSummaryDao.getInstance().getNoOfPackages(wayBillIds);
					wayBillDetails 	  = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArr ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,(short)0 ,false);

					for(final Long key: lrColl.keySet()){

						wayBill     	     = lrColl.get(key);
						reportModel 	     = categoryTypeWiseHM.get(wayBill.getWayBillTypeId());
						wayBillCharges 	 	 = wayBillDetails.get(wayBill.getWayBillId()).getWayBillCharges();

						if(reportModel == null){

							reportModel 	 = new DestinationBranchWiseBookingSummaryReport();
							chargeCollection = new HashMap<Long, Double>();

							reportModel.setWayBillTypeId(wayBill.getWayBillTypeId());
							reportModel.setNoOfPkgs(conSummaryHM.get(wayBill.getWayBillId()));
							reportModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));
							reportModel.setGrandTotal(wayBill.getBookingTotal());
							reportModel.setNoOfLR(1);

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							reportModel.setChargesCollection(chargeCollection);
							categoryTypeWiseHM.put(reportModel.getWayBillTypeId(), reportModel);
						} else {

							reportModel.setNoOfPkgs(reportModel.getNoOfPkgs() + conSummaryHM.get(wayBill.getWayBillId()));
							reportModel.setNoOfLR(reportModel.getNoOfLR() + 1);
							reportModel.setGrandTotal(reportModel.getGrandTotal() + wayBill.getBookingTotal());

							chargeCollection = reportModel.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(chargeCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
									chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargeCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
								else
									chargeCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

						}
					}

					request.setAttribute("bookingCharges", bookingCharges);
					request.setAttribute("categoryTypeWiseHM", categoryTypeWiseHM);
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
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			executive			= null;
			sdf					= null;
			fromDate			= null;
			toDate				= null;
			objectIn 			= null;
			cache				= null;
			wayBillIds			= null;
			branchIds			= null;
			bookingCharges  	= null;
			wayBillIdArr		= null;
			wayBill				= null;
			dispatchIds			= null;
			wayBillIdList		= null;
			conSummaryHM		= null;
			lrColl  			= null;
			wayBillCharges		= null;
			chargeCollection			= null;
			wayBillDetails 				= null;
			reportModel					= null;
			categoryTypeWiseHM  		= null;
		}
	}
}