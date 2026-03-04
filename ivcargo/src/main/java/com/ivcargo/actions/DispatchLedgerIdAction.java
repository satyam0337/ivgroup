package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;

public class DispatchLedgerIdAction implements Action {
	public static final String TRACE_ID = "DispatchLedgerIdAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		
		
		try {
			if (request.getParameter("wayBillId") != null) {
				request.setAttribute("wayBillId", JSPUtility.GetLong(request, "wayBillId"));
			}

			if (request.getParameter("dispatchLedgerId") != null && request.getParameter("Type") != null) {
				request.setAttribute("dispatchLedgerId", JSPUtility.GetLong(request, "dispatchLedgerId"));
				request.setAttribute("Type", JSPUtility.GetString(request, "Type"));
			}

			if(request.getParameter("DataByBranchId") != null) {
				request.setAttribute("DataByBranchId", request.getParameter("DataByBranchId"));
			}

			if(request.getParameter("NotDispatchedWB") != null) {
				request.setAttribute("NotDispatchedWB", request.getParameter("NotDispatchedWB"));
			}
			if(request.getParameter("isDispatchForOwnGroup") != null) {
				request.setAttribute("isDispatchForOwnGroup", request.getParameter("isDispatchForOwnGroup"));
			}
		} catch (Exception e) {

			e.printStackTrace();
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, e);
		}

		@SuppressWarnings("unchecked")
		HashMap<String,Object> error = (HashMap<String,Object>) request.getAttribute("error");
		if ((error.size() > 0) && error.containsKey("errorCode")) {
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "needlogin");
		}
		else{
			//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"not fnd err");
			request.setAttribute("nextPageToken", "success");
		}

	}
}