package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
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
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.FreightLessThanBookingDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.FreightLessThanBookingDetailsModel;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class FreightLessThanBookingDetailsReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		Executive        					executive   			= null;
		FreightLessThanBookingDetailsModel[]reportModel 			= null;
		CacheManip 							cacheManip 				= null;
		ReportViewModel 					reportViewModel 		= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject 						objectOut 				= null;
		Long[] 								wayBillIdArray			= null;
		SortedMap<String, FreightLessThanBookingDetailsModel> bookedLRColl = null;
		HashMap<Long, ConsignmentSummary> 	conSumColl 				= null;
		HashMap<Long, CustomerDetails>		consignorColl			= null;
		HashMap<Long, CustomerDetails>		consigneeColl			= null;
		HashMap<Long, WayBill> 				lrColl  				= null;
		String								wayBillStr				= null;
		CustomerDetails						consignor				= null;
		CustomerDetails						consignee				= null;
		ConsignmentSummary					conSum					= null;
		WayBill								wayBill					= null;
		Branch								branch					= null;
		double								amount					= 00.00;
		long								lrtype					= 0;
		String 								branchIds				    = null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeFreightLessThanBookingDetailsReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());


			cacheManip  = new CacheManip(request);
			executive   = cacheManip.getExecutive(request);

			if(!"".equals(request.getParameter("amount")))
				amount 		= Double.parseDouble(request.getParameter("amount").trim());

			lrtype		= Long.parseLong(request.getParameter("lrtype").trim());

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cacheManip, executive);

			request.setAttribute("agentName", executive.getName());

			if(amount >= 0 && lrtype!=0 && fromDate !=null && toDate !=null)
				objectOut = FreightLessThanBookingDetailsDao.getInstance().getBookingDetailsFromWayBillAndWayBillHistory(executive.getAccountGroupId(), fromDate, toDate ,amount,lrtype, branchIds);
			else if(amount >= 0 && lrtype>=0 && fromDate !=null && toDate !=null)
				objectOut = FreightLessThanBookingDetailsDao.getInstance().getBookingDetailsFromWayBillAndWayBillHistoryByAmount(executive.getAccountGroupId(), fromDate, toDate ,amount, branchIds);

			if(objectOut != null) {

				reportModel 	= (FreightLessThanBookingDetailsModel[])objectOut.get("FreightLessThanBookingDetailsModel");
				wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

				if (reportModel != null && wayBillIdArray != null) {

					wayBillStr = Utility.GetLongArrayToString(wayBillIdArray);

					if(wayBillStr != null && wayBillStr.length() > 0) {

						conSumColl 		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillStr);
						consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillStr);
						consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillStr);
						lrColl			= WayBillDao.getInstance().getLRStatusByWaybillIds(wayBillStr);
					}

					bookedLRColl	= new TreeMap<String, FreightLessThanBookingDetailsModel>();

					for (final FreightLessThanBookingDetailsModel element : reportModel) {

						if(lrColl != null && lrColl.size() > 0) {
							wayBill = lrColl.get(element.getWayBillId());
							if(wayBill != null)
								element.setStatus(wayBill.getStatus());
						}

						if(conSumColl != null && conSumColl.size() > 0) {
							conSum = conSumColl.get(element.getWayBillId());
							if(conSum != null) {
								element.setNoOfPkgs(conSum.getQuantity());
								element.setActualWeight(conSum.getActualWeight());
								element.setChargedWeight(conSum.getChargeWeight());
								element.setBookingTypeId(conSum.getBookingTypeId());
								element.setDeliveryTo(conSum.getDeliveryTo());
							}
						}

						if(consignorColl != null && consignorColl.size() > 0) {
							consignor = consignorColl.get(element.getWayBillId());
							if(consignor != null)
								element.setConsignerName(consignor.getName());
							else
								element.setConsignerName("");
						}

						if(consigneeColl != null && consigneeColl.size() > 0) {
							consignee = consigneeColl.get(element.getWayBillId());
							if(consignee != null)
								element.setConsigneeName(consignee.getName());
							else
								element.setConsigneeName("");
						}

						element.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());

						branch	= cacheManip.getGenericBranchDetailCache(request,element.getSourceBranchId());
						element.setSourceBranch(branch.getName());
						element.setSourceSubRegionId(branch.getSubRegionId());

						branch	= cacheManip.getGenericBranchDetailCache(request,element.getDestinationBranchId());
						element.setDestinationBranch(branch.getName());
						element.setDestinationSubRegionId(branch.getSubRegionId());

						if(element.getDestinationBranchId() > 0)
							element.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
						else
							element.setDestinationBranch(element.getDeliveryPlace());

						element.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(element.getWayBillTypeId()));

						bookedLRColl.put(element.getConsignerName()+"_"+element.getWayBillId(), element);
					}

					request.setAttribute("FreightLessThanBookingDetailsModel", reportModel);
					request.setAttribute("bookedLRColl", bookedLRColl);

					//******* Store Booking Charges Of Group
					request.setAttribute("BookingCharges", cacheManip.getBookingCharges(request, executive.getBranchId()));
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("searchAmount", amount);
			request.setAttribute("wayBillType", lrtype);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive   			= null;
			reportModel 			= null;
			cacheManip 				= null;
			reportViewModel 		= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			objectOut 				= null;
			wayBillIdArray			= null;
			bookedLRColl    		= null;
			conSumColl 				= null;
			consignorColl			= null;
			consigneeColl			= null;
			lrColl  				= null;
			wayBillStr				= null;
			consignor				= null;
			consignee				= null;
			conSum					= null;
			wayBill					= null;
		}

	}
}