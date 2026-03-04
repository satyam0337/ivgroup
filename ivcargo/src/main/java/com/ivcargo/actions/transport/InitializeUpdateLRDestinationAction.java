package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class InitializeUpdateLRDestinationAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			final var wayBillIdParam = request.getParameter("wayBillId");

			if(ActionStaticUtil.isSystemError(request,error) || wayBillIdParam == null)
				return;

			final var numericPart = wayBillIdParam.replaceAll("\\D+", "");

			if (!numericPart.isEmpty())
				request.setAttribute("wayBillId", Long.parseLong(numericPart));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
