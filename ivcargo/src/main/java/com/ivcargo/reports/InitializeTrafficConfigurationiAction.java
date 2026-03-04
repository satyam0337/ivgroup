package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.TrafficDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;

public class InitializeTrafficConfigurationiAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object> 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache = new CacheManip(request);
			final var  executive = cache.getExecutive(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
				final var	regionBranches = cache.getBranchesByRegionId(request, executive.getAccountGroupId(),executive.getRegionId());
				final var	branchList = regionBranches.values().stream().filter(e -> !e.isMarkForDelete()).toList();

				final var	branchArr = new Branch[branchList.size()];
				branchList.toArray(branchArr);

				request.setAttribute("trafficMasterArr", TrafficDao.getInstance().getTrafficMaster(executive.getAccountGroupId(),executive.getRegionId()));
				request.setAttribute("branchArr", branchArr);
			} else
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=19");

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}