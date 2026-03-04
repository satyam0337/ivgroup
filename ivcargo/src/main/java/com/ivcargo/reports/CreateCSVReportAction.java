package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.platform.dto.model.ReportModel;


public class CreateCSVReportAction implements Action{
	private static final String TRACE_ID = "CreateCSVReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		@SuppressWarnings("unchecked")
		HashMap<String,Object> error = (HashMap<String,Object>) request.getAttribute("error");
		if ((error.size() > 0) && error.containsKey("errorCode")) {
			LogWriter.writeLog(TRACE_ID, (Integer) error.get("errorCode"), (String) error.get("errorDescription"));
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "needlogin");
		}
		else{
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"not fnd err");
			request.setAttribute("nextPageToken", "success");

			int reportId =  JSPUtility.GetInt(request, "reportId",-1);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"reportId"+reportId);
			ReportModel[] reportModel = (ReportModel[]) request.getSession().getAttribute(reportId+"");
			request.setAttribute("reportModel", reportModel);
		}
	}
}