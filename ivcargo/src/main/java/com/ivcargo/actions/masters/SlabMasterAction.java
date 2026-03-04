package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class SlabMasterAction implements Action{
	public static final String TRACE_ID = "SlabMasterAction";
	 
	HashMap<String,Object>	error = null;
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		Executive 				executive 					= null;
		try{
			response.setContentType("application/json");//setting response for ajax
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive = (Executive)request.getSession().getAttribute("executive");
			
			if(executive != null){
			request.setAttribute("nextPageToken", "success");
			}
		}
		catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally {
			executive  		= null;
		}
	}
}