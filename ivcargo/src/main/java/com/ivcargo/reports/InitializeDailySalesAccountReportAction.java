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
import com.platform.dto.SubRegion;

public class InitializeDailySalesAccountReportAction implements Action{
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object> 	error 		= null;
		ActionInstanceUtil		actionUtil2	= null;
		Executive 				executive	= null;
		CacheManip				cacheManip	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip	= new CacheManip(request);
			executive 	= cacheManip.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_CITY_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDCITY_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute("fromSubregionLabel", "Source SubRegion");
			request.setAttribute("agencyBranchLabel", "Source Branch");
			request.setAttribute("toSubRegionLabel", "Destination SubRegion");
			request.setAttribute("toBranchLabel", "Destination Branch");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			final SubRegion[] subRegion = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("subRegionForGroup", subRegion);
			request.setAttribute("TosubRegionForGroup", subRegion);
			request.setAttribute("wayBillType", cacheManip.getAllWayBillType(request));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 		= null;
			actionUtil2	= null;
			executive	= null;
		}
	}
}
