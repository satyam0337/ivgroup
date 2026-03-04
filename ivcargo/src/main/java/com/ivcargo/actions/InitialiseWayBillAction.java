
package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class InitialiseWayBillAction implements Action {

	public static final String TRACE_ID = "InitialiseWayBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			if(request.getParameter(Constant.SHORTCUT_PARAM) != null) {
				request.getSession().setAttribute(Constant.SHORTCUT_PARAM, JSPUtility.GetString(request, Constant.SHORTCUT_PARAM));
				request.setAttribute(Constant.SHORTCUT_PARAM, JSPUtility.GetString(request, Constant.SHORTCUT_PARAM));
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 	= null;
		}
	}
}