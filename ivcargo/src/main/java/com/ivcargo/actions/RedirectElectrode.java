package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.constant.ServerIdentifierConstant;

public class RedirectElectrode implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		String						dnsUrl					= "";
		String						portNumber				= "";
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			portNumber = ":"+ServerIdentifierConstant.IVUI_PORT;
			dnsUrl = request.getScheme()+"://"+request.getServerName()+portNumber+request.getParameter("urlWithParams");
			response.sendRedirect(dnsUrl);
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
		}
	}
}