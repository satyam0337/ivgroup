package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CreditorOutstandingSummaryDAO;
import com.platform.dto.Executive;
import com.platform.dto.model.CreditorOutstandingSummaryModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class CreditorOutStandingSumaryReportAction implements Action {

	private static final String TRACE_ID = "CreditorOutStandingSumaryReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 		error 					= null;

		Executive        				executive         		= null;
		ReportViewModel 				reportViewModel 		= null;
		SimpleDateFormat 				dateFormatForTimeLog	= null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate       			= null;
		CreditorOutstandingSummaryModel[] 	creditorOutStandingArray	= null;
		long		creditorId	= 0;
		long		filter	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long startTime = System.currentTimeMillis();

			executive	= (Executive) request.getSession().getAttribute("executive");
			creditorId	= JSPUtility.GetLong(request, "creditorId",0);
			filter		= JSPUtility.GetLong(request, "filter",0);
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

			if(creditorId > 0 && filter > 0){

				fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
				toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59")).getTime());
				creditorOutStandingArray = CreditorOutstandingSummaryDAO.getInstance().getCreditorOutStandingDetailsByCreditorId(fromDate, toDate, creditorId, executive.getAccountGroupId());

				if(creditorOutStandingArray != null && creditorOutStandingArray.length > 0) {

					request.setAttribute("creditorOutStandingArray",creditorOutStandingArray);

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}		

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				//request.setAttribute("resultHM",resultHM);
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated CreditorOutStandingSummaryReport "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive         		= null;
			reportViewModel 		= null;
			dateFormatForTimeLog	= null;
			sdf            			= null;
			fromDate       			= null;
			toDate       			= null;
			creditorOutStandingArray= null;

		}
	}
}
