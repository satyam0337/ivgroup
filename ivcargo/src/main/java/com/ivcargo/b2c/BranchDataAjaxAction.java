package com.ivcargo.b2c;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;

public class BranchDataAjaxAction  implements Action {

	private static final String TRACE_ID = BranchDataAjaxAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		var 			accountGroupId	= 0L;
		var			cityId			= 0L;
		StringBuilder 	module			= null;
		ValueObject     outValueObject	= null;
		var			stateId			= 0L;
		var			branchByStateId = false;

		try {
			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
			response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
			response.addHeader("Access-Control-Max-Age", "1728000");

			final var printout = response.getWriter();

			if(request.getParameter(Constant.ACCOUNT_GROUP_ID) != null)
				accountGroupId	= Long.parseLong(request.getParameter(Constant.ACCOUNT_GROUP_ID));

			if(request.getParameter("cityId") != null)
				cityId	= Long.parseLong(request.getParameter("cityId"));

			if(request.getParameter(Constant.STATE_ID) != null && !Constant.BLANK.equals(request.getParameter(Constant.STATE_ID))) {
				stateId	= Long.parseLong(request.getParameter(Constant.STATE_ID));
				branchByStateId = true;
			}

			module	= new StringBuilder();
			module.append("&" + Constant.ACCOUNT_GROUP_ID + "=" + accountGroupId);
			module.append("&" + Constant.CITY_ID + "=" + cityId);
			module.append("&" + Constant.STATE_ID + "=" + stateId);
			module.append("&branchByStateId=" + branchByStateId);

			outValueObject = WSUtility.callPostWebService(WSUtility.getWebServiceUrl("" + WebServiceURI.BRANCH_LOCATOR), module.toString());

			if(outValueObject.get(WSUtility.WEB_SERVICE_RESULT) != null){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "WEB_SERVICE_RESULT_FOR_BRANCH_DATA : "+outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
				printout.print(outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
				printout.flush();
			} else
				printout.print(outValueObject);
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
		}
	}
}