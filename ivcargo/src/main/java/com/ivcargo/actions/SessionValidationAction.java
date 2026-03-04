package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class SessionValidationAction implements Action {

	public static final String TRACE_ID = "SessionValidationAction";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object> error = (HashMap<String,Object>) request.getAttribute("error");

		if(error == null) error = new HashMap<String, Object>();

		if (error.size() > 0 && error.containsKey(CargoErrorList.ERROR_CODE)) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, ((Integer) error.get(CargoErrorList.ERROR_CODE)).toString()+" "+(String) error.get(CargoErrorList.ERROR_DESCRIPTION));
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "needlogin");
		} else
			try {
				if(request.getSession().getAttribute(Executive.EXECUTIVE) != null) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.MULTIPLE_ACCOUNT_LOGIN_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.MULTIPLE_ACCOUNT_LOGIN_ERROR_DESCRIPTION);
					request.setAttribute("error", error);
				}
			} catch (final Exception e) {
				e.printStackTrace();
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
	}
}