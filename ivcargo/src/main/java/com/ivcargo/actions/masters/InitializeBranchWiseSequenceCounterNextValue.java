package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeBranchWiseSequenceCounterNextValue implements Action{
	public static final String TRACE_ID = "InitializeBranchWiseSequenceCounterNextValue";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 error 					= null;
		CacheManip cache                                 = null;
		try{
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache = new CacheManip(request);
			final Executive loggedInExec = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection2(request, cache, loggedInExec);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}finally{
			cache 						 = null;
		}

	}
}

