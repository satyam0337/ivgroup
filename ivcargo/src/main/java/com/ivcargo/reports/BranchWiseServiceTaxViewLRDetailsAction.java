package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchWiseServiceTaxReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.model.BranchWiseServiceTaxSummaryReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class BranchWiseServiceTaxViewLRDetailsAction implements Action {

	private static final String TRACE_ID = "BranchWiseServiceTaxViewLRDetailsAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 			error 					= null;
		Executive        					executive   			= null;
		ReportViewModel 					reportViewModel 		= null;
		SimpleDateFormat   					dateFormatForTimeLog 	= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject 						objectOut 				= null;
		BranchWiseServiceTaxReportBLL		branchWiseSTReportBLL   = null;
		ValueObject							valueInObject			= null;
		SortedMap<String, BranchWiseServiceTaxSummaryReportModel>      bookingHM = null;		
		SortedMap<String, BranchWiseServiceTaxSummaryReportModel>      cancelHM  = null;
		SortedMap<String, BranchWiseServiceTaxSummaryReportModel>      deliveryHM= null;
		ArrayList<Long>                      assignedLocationsIdList= null;  
		CacheManip							cache					= null;
		long  branchId		= 0;
		short filter 		= 0;	

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
			filter		= Short.parseShort(request.getParameter("filter"));
			branchId  	= Long.parseLong(request.getParameter("branchId"));
			cache  		= new CacheManip(request);

			executive   = (Executive) request.getSession().getAttribute("executive");

			if(filter > 0 && branchId > 0){


				assignedLocationsIdList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

				if(!assignedLocationsIdList.contains(branchId)){
					assignedLocationsIdList.add(branchId);
				}

				valueInObject = new ValueObject();
				valueInObject.put("accountGroupId", executive.getAccountGroupId());
				valueInObject.put("branchesIds", ""+branchId);
				valueInObject.put("fromDate", fromDate);
				valueInObject.put("toDate", toDate);
				valueInObject.put("filter", filter);

				branchWiseSTReportBLL = new BranchWiseServiceTaxReportBLL();
				objectOut	= branchWiseSTReportBLL.getServiceTaxLRDetails(valueInObject);

				if(objectOut != null) {

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);

					if(objectOut.get("bookingHM") != null){
						bookingHM = (SortedMap<String, BranchWiseServiceTaxSummaryReportModel> )objectOut.get("bookingHM");
					}
					if(objectOut.get("cancelHM") != null){
						cancelHM = (SortedMap<String, BranchWiseServiceTaxSummaryReportModel> )objectOut.get("cancelHM");
					}
					if(objectOut.get("deliveryHM") != null){
						deliveryHM = (SortedMap<String, BranchWiseServiceTaxSummaryReportModel> )objectOut.get("deliveryHM");
					}

					request.setAttribute("bookingHM", bookingHM);
					request.setAttribute("cancelHM", cancelHM);
					request.setAttribute("deliveryHM", deliveryHM);

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}


			request.setAttribute("nextPageToken", "success");
			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated BranchWiseServiceTaxViewLRDetailsAction "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive   		= null;
			reportViewModel 	= null;
			dateFormatForTimeLog= null;
			sdf            		= null;
			fromDate       		= null;
			toDate         		= null;
			objectOut 			= null;
		}
	}
}
