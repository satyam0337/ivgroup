package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.constant.TransCargoAccountGroupConstant;

public class InitializeDispatchSearchPrintAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;
		String			accountGroupName			= null;
		String			branchAddress		= null;
		String			branchPhoneNo		= null;
		Executive		executive			= null;


		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive 					= (Executive) request.getSession().getAttribute("executive");
			accountGroupName 			= request.getParameter("accountGroupName");
			branchAddress	  			= request.getParameter("branchAddress");
			branchPhoneNo				= request.getParameter("branchPhoneNo");

			request.setAttribute("accountGroupName", accountGroupName);
			request.setAttribute("branchAddress", branchAddress);
			request.setAttribute("branchPhoneNo", branchPhoneNo);

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SRIDATTA)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DECENT_LORRY_SERVICE
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JTM
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ABBAS
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KRL
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHALAXMI
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DSL
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GOWTHAM)
				request.setAttribute("nextPageToken", "success_231");
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}