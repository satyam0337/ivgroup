package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CustomerOrderBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.CustomerOrder;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class InitializeUpdateCustomerOrder implements Action{
	public static final String TRACE_ID = "InitializeUpdateCustomerOrder";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;
		Executive executive 	= null;
		CustomerOrderBLL bll 	= null;
		ValueObject inValObj 	= null;
		ValueObject outValObj 	= null;
		CustomerOrder custOrder = null;
		try{
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			executive = (Executive)request.getSession().getAttribute("executive");
			if(executive != null){
				final String message = JSPUtility.GetString(request, "message", null);
				if(request.getParameter("customerOrderId") != null){
					final long customerOrderId = JSPUtility.GetLong(request, "customerOrderId");
					bll = new CustomerOrderBLL();
					inValObj = new ValueObject();
					inValObj.put("executive", executive);
					inValObj.put("customerOrderId", customerOrderId);
					outValObj = bll.searchSingleOrderForUpdate(inValObj);
					custOrder = (CustomerOrder) outValObj.get("custOrder");
					request.setAttribute("custOrder", custOrder);
				}
				request.setAttribute("message", message);
			}else {
				error.put("errorCode", CargoErrorList.SESSION_INVALID);
				error.put("errorDescription", CargoErrorList.SESSION_INVALID_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SESSION_INVALID + ""+"You have been logged out. Please login again.");
				request.setAttribute("error", error);
			}
			request.setAttribute("nextPageToken", "success");
		}
		catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
