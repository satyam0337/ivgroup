package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializePackageWisePendingDeliveryReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache = new CacheManip(request);
			final var	executive 	 	= cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			final var	isShowGroupMergingBranchData	= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA,false);

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, isShowGroupMergingBranchData);
			request.setAttribute("confValObj", confValObj);

			request.setAttribute("fromSubregionLabel", "Source SubRegion");
			request.setAttribute("toSubRegionLabel", "Destination SubRegion");
			request.setAttribute("toBranchLabel", "Destination Branch");

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var subRegions = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId(), isShowGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", subRegions);
			request.setAttribute("TosubRegionForGroup", subRegions);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
