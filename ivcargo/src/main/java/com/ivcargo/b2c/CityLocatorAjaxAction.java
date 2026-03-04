package com.ivcargo.b2c;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;

public class CityLocatorAjaxAction  implements Action {

	private static final String TRACE_ID = CityLocatorAjaxAction.class.getName();
	
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		long 			accountGroupId	= 0;
		long			stateId			= 0;
		StringBuffer 	module			= null;
		ValueObject     outValueObject	= null;
		
		try {
			
			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
	        response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
	        response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
	        response.addHeader("Access-Control-Max-Age", "1728000");
			
		     PrintWriter printout = response.getWriter();
			
			if(request.getParameter("accountGroupId") != null) {
				accountGroupId	= Long.parseLong(request.getParameter("accountGroupId"));
			}
			
			if(request.getParameter("stateId") != null) {
				stateId	= Long.parseLong(request.getParameter("stateId"));
			}			
			module	= new StringBuffer();
			module.append("&accountGroupId=" + accountGroupId);
			module.append("&stateId=" + stateId);
			
			outValueObject = WSUtility.callPostWebService(WSUtility.getWebServiceUrl("" + WebServiceURI.BRANCH_LOCATOR), module.toString());
			if(outValueObject.get(WSUtility.WEB_SERVICE_RESULT) != null){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "WEB_SERVICE_RESULT_FOR_CITY : "+outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
				printout.print(outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
				 printout.flush();
			} else {
				printout.print(outValueObject);
			}
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
		}
		
	}

}
