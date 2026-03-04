package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class UserLoginAction implements Action {

	public static final String TRACE_ID = "UserLoginAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 						= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}