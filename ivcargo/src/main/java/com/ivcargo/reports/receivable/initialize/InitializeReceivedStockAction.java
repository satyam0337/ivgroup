package com.ivcargo.reports.receivable.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeReceivedStockAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 		= new CacheManip(request);
			final var	executive 	 	= cacheManip.getExecutive(request);

			final var	confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			final var	isShowGroupMergingBranchData	= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA,false);

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW,false);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW,false);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, isShowGroupMergingBranchData);
			request.setAttribute("confValObj", confValObj);

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY,false))
				request.setAttribute("fromSubregionLabel", "From City");
			else
				request.setAttribute("fromSubregionLabel", "Source SubRegion");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_DESTINATION_SUB_REGION_TO_TO_CITY,false))
				request.setAttribute("toSubRegionLabel", "To City");
			else
				request.setAttribute("toSubRegionLabel", "Destination SubRegion");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_DESTINATION_BRANCH_TO_TO_BRANCH,false))
				request.setAttribute("toBranchLabel", "To Branch");
			else
				request.setAttribute("toBranchLabel", "Destination Branch");

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)
				request.setAttribute("execu", ExecutiveDao.getInstance().findByBranchId(executive.getBranchId()));

			final var	allsubregionsdataforgrouparray	= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId(), isShowGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", allsubregionsdataforgrouparray);
			request.setAttribute("TosubRegionForGroup", allsubregionsdataforgrouparray);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}