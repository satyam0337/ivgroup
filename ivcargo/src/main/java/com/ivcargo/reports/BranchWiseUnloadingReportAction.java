package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

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
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchWiseUnLoadingReportDao;
import com.platform.dao.ReceivedLedgerDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.ReceivedLedger;
import com.platform.dto.SubRegion;
import com.platform.dto.TURRegisterReport;
import com.platform.dto.WayBill;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BranchWiseUnloadingReportAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive        				executive      			= null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate         			= null;
		TURRegisterReport[] 			reports 				= null;
		CacheManip 						cManip 					= null;
		String							receivedLedgerIds		= null;
		ValueObject                     outValueObject          = null;
		Long[]      	 				receivedLedgerIdArr     = null;
		Long[]      	 				wayBillIdArray	        = null;
		SortedMap<String,TURRegisterReport> branchWiseUnLoadingColl= null;
		TURRegisterReport				model					= null;
		String							wayBillIds       		= null;
		HashMap<Long,ReceivedLedger>	receHM					= null;
		HashMap<Long,WayBill> 			lrColl  				= null;
		WayBill							wayBill					= null;
		Branch 							branch 					= null;
		SubRegion 						subRegion				= null;
		ArrayList<Long>                 locationMappingList		= null;
		long 							branchId				= 0;
		ValueObject						branches				= null;
		ValueObject						subregions				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseUnloadingReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip 		= new CacheManip(request);
			branches	= cManip.getGenericBranchesDetail(request);
			subregions	= cManip.getAllSubRegions(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final long accountGroupId = executive.getAccountGroupId();

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			outValueObject = BranchWiseUnLoadingReportDao.getInstance().getBranchWiseUnLoadingData(fromDate, toDate, branchId, accountGroupId);

			if(outValueObject != null) {
				reports 			= (TURRegisterReport[]) outValueObject.get("reportArr");
				receivedLedgerIdArr	= (Long[]) outValueObject.get("receivedLedgerIdArray");
				wayBillIdArray		= (Long[]) outValueObject.get("wayBillIdArray");

				if(reports != null) {
					branchWiseUnLoadingColl = new TreeMap<String, TURRegisterReport>();

					receivedLedgerIds = Utility.GetLongArrayToString(receivedLedgerIdArr);
					wayBillIds		  = Utility.GetLongArrayToString(wayBillIdArray);

					receHM			  = ReceivedLedgerDao.getInstance().getReceivedLedgerDetailsByReceivedLedgerId(receivedLedgerIds);
					lrColl			  = WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);
					locationMappingList = cManip.getAssignedLocationsIdListByLocationIdId(request, branchId, accountGroupId);

					for (final TURRegisterReport report : reports) {
						wayBill = lrColl.get(report.getWayBillId());

						ReceivedLedger reciLedger = receHM.get(report.getReceivedLedgerId());

						if(reciLedger == null) reciLedger = new ReceivedLedger();

						if(locationMappingList.contains(wayBill.getDestinationBranchId())) {
							model = branchWiseUnLoadingColl.get(report.getTurNumber() + "_" + report.getReceivedLedgerId());

							if(model == null){
								model = new TURRegisterReport();
								branch = (Branch) branches.get(reciLedger.getTurBranchId() + "");

								if(branch != null)
									subRegion = (SubRegion) subregions.get(branch.getSubRegionId());

								model.setTotalNoOfPackages((int)(report.getQuantity() - report.getShortLuggage()));
								model.setTotalNoOfWayBills(1);
								model.setTotalActualWeight(report.getActualUnloadWeight());
								model.setTurBranchName(branch != null ? branch.getName() : "--");
								model.setTurSubRegionName(subRegion != null ? subRegion.getName() : "--");

								branch = (Branch) branches.get(reciLedger.getSourceBranchId() + "");

								model.setSourceBranch(branch != null ? branch.getName() : "--");

								branch = (Branch) branches.get(reciLedger.getDestinationBranchId() + "");

								model.setDestinationBranch(branch != null ? branch.getName() : "--");

								model.setWayBillReceivedDateTime(report.getWayBillReceivedDateTime());
								model.setLsDateTime(reciLedger.getTripDateTime());
								model.setLsNumber(report.getLsNumber());
								model.setTurNumber(report.getTurNumber());
								model.setVehicleNumber(Utility.checkedNullCondition(reciLedger.getVehicleNumber(), (short) 1));
								model.setTurBranchId(reciLedger.getTurBranchId());
								model.setCrossingAgentId(reciLedger.getCrossingAgentId());
								model.setCrossingAgent(reciLedger.isCrossing());
								model.setReceivedLedgerId(report.getReceivedLedgerId());
								model.setDispatchLedgerId(report.getDispatchLedgerId());

								if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									model.setToPayBookingTotal(wayBill.getBookingChargesSum() + wayBill.getBookingTimeServiceTax());

								model.setBookingTotal(wayBill.getBookingChargesSum());
								model.setFreightTotal(wayBill.getGrandTotal());
								branchWiseUnLoadingColl.put(report.getTurNumber() + "_" + report.getReceivedLedgerId(), model);
							} else {
								model.setTotalNoOfPackages((int)(model.getTotalNoOfPackages() + (report.getQuantity() - report.getShortLuggage())));
								model.setTotalNoOfWayBills(model.getTotalNoOfWayBills() + 1);
								model.setTotalActualWeight(model.getTotalActualWeight() + report.getActualUnloadWeight());

								if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									model.setToPayBookingTotal(model.getToPayBookingTotal() + wayBill.getBookingChargesSum() + wayBill.getBookingTimeServiceTax());

								model.setBookingTotal(model.getBookingTotal() + wayBill.getBookingChargesSum());
								model.setFreightTotal(model.getFreightTotal() + wayBill.getGrandTotal());
							}
						}
					}

					request.setAttribute("branchWiseUnLoadingColl", branchWiseUnLoadingColl);
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
			error 					= null;
			executive      			= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			reports 				= null;
			cManip 					= null;
			receivedLedgerIds		= null;
			outValueObject          = null;
			receivedLedgerIdArr     = null;
			wayBillIdArray	        = null;
			branchWiseUnLoadingColl	= null;
			model					= null;
			wayBillIds       		= null;
			receHM					= null;
			lrColl  				= null;
			wayBill					= null;
			branch 					= null;
			subRegion				= null;
			locationMappingList		= null;
		}
	}
}