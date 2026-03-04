package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeCrossingAgentReportAction implements Action {
	public static final String TRACE_ID = "InitializeCrossingAgentReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache   	= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection3(request, cache, executive);

			request.setAttribute("crossingAgentList", CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentByGroupId(executive.getAccountGroupId()));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}