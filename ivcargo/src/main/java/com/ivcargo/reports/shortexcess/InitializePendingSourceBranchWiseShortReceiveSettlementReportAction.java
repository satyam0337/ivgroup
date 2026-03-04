package com.ivcargo.reports.shortexcess;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.shortexcess.ShortRegisterReportConfigurationDTO;

public class InitializePendingSourceBranchWiseShortReceiveSettlementReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	cache 		= new CacheManip(request);
			final var   executive 	= cache.getExecutive(request);
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.SOURCE_BRANCH_WISE_PENDING_SHORT_EXCESS_SETTLEMENT, executive.getAccountGroupId());
			final var	accountGroupId					= executive.getAccountGroupId();
			final var	viewAllRecords					= configuration.getBoolean(ShortRegisterReportConfigurationDTO.VIEW_ALL_RECORDS, false);
			final var	isCustomColumnNeeded			= configuration.getBoolean(ShortRegisterReportConfigurationDTO.IS_CUSTOM_COLUMN_NEEDED, false);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("nextPageToken", "success");
			request.setAttribute("viewAllRecords", viewAllRecords);
			request.setAttribute("isCustomColumnNeeded", isCustomColumnNeeded);
			request.setAttribute("accountGroupId", accountGroupId);

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
