
package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.WayBillDao;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;

public class InitialiseDummyWayBillAction implements Action {

	public static final String TRACE_ID = InitialiseDummyWayBillAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		Executive				executive		= null;
		ArrayList<WayBill>		oldDummyLRList	= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive 		= (Executive) request.getSession().getAttribute("executive");
			oldDummyLRList	= WayBillDao.getInstance().checkOldDummyLR(executive.getAccountGroupId(), executive.getBranchId());
			if (!oldDummyLRList.isEmpty()) {
				request.setAttribute("oldUsedDummyExists", true);
			} else {
				request.setAttribute("oldUsedDummyExists", false);
			}
			request.setAttribute("isDummyLR", true);
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error			= null;
			executive		= null;
		}
	}
}