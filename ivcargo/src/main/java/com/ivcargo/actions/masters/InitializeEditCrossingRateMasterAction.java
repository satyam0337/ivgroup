package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeEditCrossingRateMasterAction implements Action {
	public static final String TRACE_ID = "InitializeEditCrossingRateMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 						= null;

		try{
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 	cache 	= new CacheManip(request);
			final var 	exec 	= cache.getExecutive(request);

			final var configuration		= cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_RATE_MASTER);

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, exec);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
