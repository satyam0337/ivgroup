package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.Region;
import com.platform.dto.model.ReportViewModel;

public class InitializeBranchWiseTrafficAction implements Action{

	public static final String TRACE_ID = "InitializeBranchWiseTrafficAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;


		Executive   			executive				= null;
		CacheManip 				cache					= null;
		ReportViewModel 		reportViewModel 		= null;
		String					accountGroupNameForPrint= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache 		= new CacheManip(request);
			executive 	= cache.getExecutive(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				final Region[] regionForGroup = cache.getRegionsByGroupId(request, executive.getAccountGroupId());
				request.setAttribute("regionForGroup", regionForGroup);
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			accountGroupNameForPrint = reportViewModel.getAccountGroupName();
			request.setAttribute("accountGroupNameForPrint",accountGroupNameForPrint);

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request,e, error);
		} finally {
			executive			= null;
			cache				= null;
			reportViewModel 	= null;
		}
	}
}