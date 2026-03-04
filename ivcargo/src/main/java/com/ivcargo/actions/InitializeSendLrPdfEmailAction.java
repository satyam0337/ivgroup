package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class InitializeSendLrPdfEmailAction implements Action{
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String, Object>	error 					= null;
		long					wayBillId				= 0;
		long					accountGroupId			= 0;
		Executive				executive				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			executive		= (Executive) request.getSession().getAttribute("executive");
			wayBillId		= Long.parseLong(request.getParameter("wayBillId"));
			accountGroupId	= executive.getAccountGroupId();

			request.setAttribute("accountGroupId", accountGroupId);
			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive	= null;
		}
	}
}
