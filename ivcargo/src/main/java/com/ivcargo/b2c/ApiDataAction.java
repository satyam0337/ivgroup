/**
 *
 */
package com.ivcargo.b2c;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.security.PasswordUtils;
import com.iv.utils.webService.WSUtility;
import com.platform.dao.ExecutiveDao;

/**
 * @author AJ
 *
 */
public class ApiDataAction implements Action {
	private static final String TRACE_ID = ApiDataAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		var			executiveId		= 0L;

		try {
			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
			response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
			response.addHeader("Access-Control-Max-Age", "1728000");

			final var printout = response.getWriter();

			var	accountGroupId	= JSPUtility.GetLong(request, Constant.ACCOUNT_GROUP_ID, 0);
			final var	filter	= JSPUtility.GetShort(request, Constant.FILTER, (short) 0);

			if(accountGroupId == 0) {
				final var	groupCode 	= request.getParameter("groupCode");
				final var	username	= request.getParameter(Constant.USER_NAME);
				final var	password	= request.getParameter(Constant.PASSWORD);

				final var	executive	= ExecutiveDao.getInstance().findByExecutiveLogin(username, password, groupCode);

				if(executive != null && PasswordUtils.checkPassword(password, executive.getPassword())) {
					accountGroupId	= executive.getAccountGroupId();
					executiveId		= executive.getExecutiveId();
				}
			}

			request.setAttribute("fromApi", true);

			final var clientInfo	= ClientInfo.getClientInfo(request);

			final Map<String, Object> modules	= new HashMap<>();

			modules.put(Constant.ACCOUNT_GROUP_ID, accountGroupId);
			modules.put(Constant.EXECUTIVE_ID, executiveId);
			modules.put("bypassSession", true);
			modules.put(Constant.TOKEN, request.getParameter(Constant.TOKEN));
			modules.put(Constant.FROM_DATE, request.getParameter(Constant.FROM_DATE));
			modules.put(Constant.TO_DATE, request.getParameter(Constant.TO_DATE));
			modules.put(Constant.BROWSER_INFO, clientInfo.getUserAgent());
			modules.put(Constant.IP_ADDRESS, clientInfo.getIpAddress());
			modules.put(Constant.MAC_ADDRESS, clientInfo.getMacAddress());
			modules.put(Constant.VEHICLE_NUMBER, request.getParameter(Constant.VEHICLE_NUMBER));
			modules.put(Constant.COMPANY_ID, request.getParameter("comapnyId"));

			if(filter > 0) {
				final var url	= WSUtility.getWebServiceUrl("" + filter);

				//modules.put(Constant.URL, clientInfo.getUrl() + "~" + url);
				modules.put(Constant.URL, clientInfo.getUrl());

				final var result1 = modules.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue()).collect(Collectors.joining("&"));

				final var module	= new StringBuilder();
				module.append("&" + result1);

				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "module = " + module.toString());

				final var	outValueObject = WSUtility.callPostWebService(url, module.toString());

				if(outValueObject.get(WSUtility.WEB_SERVICE_RESULT) != null) {
					printout.print(outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
					printout.flush();
				} else
					printout.print(outValueObject);
			} else {
				final var jsonObject	= new JSONObject();
				jsonObject.put("error", "Wrong data provided!");

				printout.print(jsonObject);
				printout.flush();
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
