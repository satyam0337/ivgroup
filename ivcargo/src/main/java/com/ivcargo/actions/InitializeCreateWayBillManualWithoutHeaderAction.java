package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class InitializeCreateWayBillManualWithoutHeaderAction implements Action{
	public static final String TRACE_ID = InitializeCreateWayBillManualWithoutHeaderAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 				= null;

		try {
			new InitializeCreateWayBillManualAction().execute(request, response);
			request.setAttribute("nextPageToken", "success");
			
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}