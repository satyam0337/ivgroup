package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeExecutiveDetailsAction implements Action{

	public static final String TRACE_ID = "InitializeExecutiveDetailsAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response){
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		CacheManip				cache				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStaticUtil.setBranchSelectionBooleans(request, executive);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive			= null;
			cache				= null;
		}
	}
}
