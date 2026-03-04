package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.LHPVDao;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class PaymentOfLHPVAction implements Action{

	private static final String TRACE_ID = "PaymentOfLHPVAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>  error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			Executive		executive	= (Executive) request.getSession().getAttribute("executive");
			String[] 		lhpvArr 	= request.getParameterValues("checkbox");
			StringBuffer 	str 		= new StringBuffer();
			String 			lhpvStr 	= null;

			for(int i = 0; i < lhpvArr.length ; i++){
				str.append(lhpvArr[i]);
				if(i!=(lhpvArr.length-1)){
					str.append(",");
				}
			}
			lhpvStr = str.toString();

			boolean retVal = LHPVDao.getInstance().updateLHPVModuleReport(lhpvStr ,executive);

			if(retVal) {
				new LHPVModuleReportAction().execute(request, response);
				request.setAttribute("nextPageToken", "success");
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
