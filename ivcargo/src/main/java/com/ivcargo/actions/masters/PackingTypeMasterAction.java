package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class PackingTypeMasterAction implements Action{
	public static final String TRACE_ID = "PackingTypeMasterAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {

		}
	}
}