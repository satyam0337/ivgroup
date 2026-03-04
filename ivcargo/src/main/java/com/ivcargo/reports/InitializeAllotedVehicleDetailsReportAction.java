package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.TransportCommonMaster;

public class InitializeAllotedVehicleDetailsReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW,false);

			final var cache = new CacheManip(request);
			final var executive = cache.getExecutive(request);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("vehicleList", cache.getOwnVehicleNumberList(request, executive.getAccountGroupId(), executive.getRegionId(), TransportCommonMaster.DATA_LEVEL_REGION_ID));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				request.setAttribute("vehicleList", cache.getOwnVehicleNumberList(request, executive.getAccountGroupId(), executive.getSubRegionId(), TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID));
			else
				request.setAttribute("vehicleList", cache.getOwnVehicleNumberList(request, executive.getAccountGroupId(), executive.getBranchId(), TransportCommonMaster.DATA_LEVEL_BRANCH_ID));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}