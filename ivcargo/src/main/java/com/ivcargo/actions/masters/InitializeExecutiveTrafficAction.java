package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.TrafficDao;

public class InitializeExecutiveTrafficAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>	 error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	cache 		= new CacheManip(request);
			final var   executive 	= cache.getExecutive(request);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				request.setAttribute("trafficMasterArr", TrafficDao.getInstance().getTrafficMaster(executive.getAccountGroupId(), executive.getRegionId()));
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
			} else
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=19");

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}