package com.ivcargo.reports.shortexcess;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializePendingDamageReceiveSettlementReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	cache 		= new CacheManip(request);
			final var   executive 	= cache.getExecutive(request);
			final var	accountGroupId					= executive.getAccountGroupId();

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("nextPageToken", "success");
			request.setAttribute("accountGroupId", accountGroupId);

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
