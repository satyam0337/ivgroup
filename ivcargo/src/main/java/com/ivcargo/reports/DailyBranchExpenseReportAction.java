package com.ivcargo.reports;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchExpenseBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.DailyBranchExpenseReportModel;
import com.platform.resource.CargoErrorList;

@Deprecated
public class DailyBranchExpenseReportAction implements Action {

	private static final String TRACE_ID = "DailyBranchExpenseReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 				= null;
		Executive        				executive       	= null;
		Branch[]    	 				branches  			= null;
		ValueObject 					objectIn 			= null;
		ValueObject 					objectOut 			= null;
		BranchExpenseBLL 				branchExpenseBLL 	= null;
		DailyBranchExpenseReportModel[] models				= null;
		CacheManip 						cache 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeDailyBranchExpenseReportAction().execute(request, response);

			objectIn  = new ValueObject();
			executive = (Executive) request.getSession().getAttribute("executive");

			long selectedSubRegion = 0;
			if (request.getParameter("subRegion")!=null){
				selectedSubRegion  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;
			}
			branches = new CacheManip(request).getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedSubRegion);
			request.setAttribute("branches", branches);

			objectIn.put("executive", executive);
			objectIn.put("fromDate", JSPUtility.GetString(request, "fromDate"));
			objectIn.put("toDate", JSPUtility.GetString(request, "toDate"));
			objectIn.put("Branch", JSPUtility.GetLong(request, "branch", 0));
			objectIn.put("selectedSubRegion", selectedSubRegion);

			branchExpenseBLL	= new BranchExpenseBLL();
			objectOut 			= branchExpenseBLL.getBranchExpenseDetails(objectIn);

			if(objectOut != null) {

				models = (DailyBranchExpenseReportModel[])objectOut.get("DailyBranchExpenseReportModel");
				if(models != null) {

					cache = new CacheManip(request);
					for (int i = 0; i < models.length; i++) {

						models[i].setBranchName(cache.getGenericBranchDetailCache(request,models[i].getBranchId()).getName());
						/*models[i].setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), models[i].getCityId(), models[i].getBranchId()).getName());*/
					}
					request.setAttribute("DailyBranchExpenseReportModel", models);
					/*	ReportViewModel reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);*/

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
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

			SimpleDateFormat dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DAILYBRANCHEXPENSEREPORT +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			executive       	= null;
			branches  			= null;
			objectIn 			= null;
			objectOut 			= null;
			branchExpenseBLL 	= null;
			models				= null;
			cache 				= null;
		}
	}
}
