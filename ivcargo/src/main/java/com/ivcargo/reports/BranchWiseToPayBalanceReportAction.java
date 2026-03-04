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
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.reports.BranchWiseToPayBalanceReportDAO;
import com.platform.dto.Executive;
import com.platform.dto.model.BranchWiseToPayBalanceReportModel;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.resource.CargoErrorList;
@Deprecated
public class BranchWiseToPayBalanceReportAction implements Action{

	private static final String TRACE_ID = "BranchWiseToPayBalanceReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 			= null;
		Executive       		executive       = null;
		long 					selectedSubRegion =  0;
		long   					branchId 		=  0;
		SimpleDateFormat 		sdf             = null;
		Timestamp        		fromDate        = null;
		Timestamp        		toDate        	= null;

		ValueObject objectIn = new ValueObject();
		ValueObject objectOut = new ValueObject();

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeBranchWiseToPayBalanceReportAction().execute(request, response);

			executive       = (Executive)request.getSession().getAttribute("executive");
			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate        	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59")).getTime());

			objectIn = new ValueObject();
			objectOut = new ValueObject();

			// Get the Selected  Combo values
			if(request.getParameter("TosubRegion")!=null){
				selectedSubRegion  =  Long.parseLong(JSPUtility.GetString(request, "TosubRegion")) ;
			}

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN){
				objectIn.put("subRegionId", selectedSubRegion);
			}/*else if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_AGENCYADMIN){
				objectIn.put("agencyId",executive.getAgencyId());
			}*/else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED){
				branchId = executive.getBranchId();
			}
			objectIn.put("branchId", branchId);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executive", executive);

			objectOut= BranchWiseToPayBalanceReportDAO.getInstance().getReport(objectIn);

			BranchWiseToPayBalanceReportModel [] reportModel = (BranchWiseToPayBalanceReportModel[])objectOut.get("ReportModel");

			/*ReportViewModel reportViewModel =new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);*/

			if(reportModel != null){
				// generate report id for printing purpose
				/*int reportId = new Random().nextInt(10000);
	                request.getSession().setAttribute(reportId+"",reportModel);
	                request.setAttribute("reportId", reportId);*/
				request.setAttribute("reportModel", reportModel);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");

				SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
				dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.BRANCHWISETOPAYBALANCEREPORT +" "+executive.getAccountGroupId()+
						" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));                }
			else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 			= null;
			executive       = null;
			sdf             = null;
			fromDate        = null;
			toDate        	= null;
		}
	}
}
