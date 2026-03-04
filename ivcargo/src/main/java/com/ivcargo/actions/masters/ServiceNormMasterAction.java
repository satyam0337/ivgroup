package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class ServiceNormMasterAction implements Action{
	public static final String TRACE_ID = "ServiceNormMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object> error 					= null;
		Executive loggedInExec                           = null;
		CacheManip cache                                 = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache 			= new CacheManip(request);
			loggedInExec 	= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection(request, cache, loggedInExec);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			loggedInExec 				 = null;
			cache 						 = null;
		}
	}
}
