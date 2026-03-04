package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.platform.dto.model.ReportViewModel;

public class InitializeSuccessAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		ReportViewModel 		reportViewModel 		= null;
		String					accountGroupNameForPrint= null;

		try{

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			accountGroupNameForPrint = reportViewModel.getAccountGroupName();
			request.setAttribute("accountGroupNameForPrint",accountGroupNameForPrint);

			request.setAttribute("nextPageToken", "success");

		}
		catch (Exception _e) {
			ActionStepsUtil.catchActionException(request,_e, error);
		} 
	}
}