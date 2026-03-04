
package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class BillSuccessAfterPaidCreditCreationAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

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
