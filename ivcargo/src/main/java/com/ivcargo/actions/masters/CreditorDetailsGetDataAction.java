package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditorDetailsBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.platform.dto.CreditorDetailsDTO;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;

public class CreditorDetailsGetDataAction implements Action{
	private static final String TRACE_ID = "CreditorDetailsGetDataAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 				error 						= null;
		Executive        						executive      				= null;
		HashMap<String,CreditorDetailsDTO>		creditorDetailsfrombllHM	= null;
		CreditorDetailsBLL						creditordetailsbll			= null;
		ReportViewModel 						reportViewModel 			= null;
		String									accountGroupNameForPrint	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive = (Executive) request.getSession().getAttribute("executive");
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				creditordetailsbll = new CreditorDetailsBLL();
				creditorDetailsfrombllHM = (HashMap<String,CreditorDetailsDTO>)creditordetailsbll.getCreditorDetails(executive.getAccountGroupId());
				//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_TRACE, "--> accountgroupId "+executive.getAccountGroupId());
				request.setAttribute("creditordetails", creditorDetailsfrombllHM);

			}else{
				request.setAttribute("creditordetails", null);
			}

			request.setAttribute("nextPageToken", "success");

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			accountGroupNameForPrint = reportViewModel.getAccountGroupName();

			request.setAttribute("accountGroupNameForPrint",accountGroupNameForPrint);
			request.setAttribute("ReportViewModel",reportViewModel);

		}catch(Exception e){
			ActionStepsUtil.catchActionException(request, e, error);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e.getMessage());
		} finally {
			executive      				= null;
			creditorDetailsfrombllHM	= null;
			creditordetailsbll			= null;
			reportViewModel 			= null;
			accountGroupNameForPrint	= null;
		}
	}
}
