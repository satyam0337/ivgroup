package com.ivcargo.reports;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.collection.initialize.InitializeALLBranchWiseCollectionReportAction;
import com.platform.dao.reports.DailyBranchWiseBookingDispatchAmountReportDao;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;

public class DailyBranchWiseBookingDispatchAmountReportAction implements Action {

	private static final String TRACE_ID = "DailyBranchWiseBookingDispatchAmountReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String, Object>	error 	= null;
		
		try{
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request,error)) {
				return;
			}

			new InitializeALLBranchWiseCollectionReportAction().execute(request, response);
			
			Executive   		executive 	= (Executive) request.getSession().getAttribute("executive");
			ValueObject 		objectIn 	= new ValueObject();
			ValueObject 		objectOut 	= new ValueObject();
			
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("Year", JSPUtility.GetString(request, "GroupSelectYear"));
			
			objectOut 		= DailyBranchWiseBookingDispatchAmountReportDao.getInstance().getDailyBranchWiseBookingDispatchAmountReportDao(objectIn);
			
			request.setAttribute("LinkedHashMap", objectOut.get("LinkedHashMap"));		
			
			InitializeDailyBranchWiseBookingDispatchAmountReportAction is	= new InitializeDailyBranchWiseBookingDispatchAmountReportAction();
			is.execute(request, response);
			
			ReportView 		reportView		= new ReportView();	
			ReportViewModel reportViewModel	= new ReportViewModel();
			
			reportViewModel		= reportView.populateReportViewModel(request, reportViewModel);
			
			request.setAttribute("ReportViewModel", reportViewModel);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error = "+_e.getMessage());
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
