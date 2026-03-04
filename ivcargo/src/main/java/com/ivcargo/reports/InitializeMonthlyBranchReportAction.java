package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeMonthlyBranchReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		ActionInstanceUtil 		actionUtil2 	= null;
		Executive   			executive 		= null;
		CacheManip				cacheManip		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW,false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute("cityBranchLabel", "From Branch");

			cacheManip	= new CacheManip(request);
			executive = cacheManip.getExecutive(request);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 			= null;
			actionUtil2 	= null;
			executive 		= null;
		}
	}
}