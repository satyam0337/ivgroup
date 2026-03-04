package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;

/**
 * @author Anant Chaudhary	21-11-2015
 *
 */
public class GetPendingExcessRegisterSettlementAction implements Action {

	public static final String TRACE_ID	= "GetPendingExcessRegisterSettlementAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		PrintWriter 					out							= null;
		JSONObject						jsonObjectOut				= null;
		JSONObject						getJsonObject				= null;
		ValueObject						valueObjectOut				= null;
		ValueObject						valueObjectIn				= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json");

			out 					= response.getWriter();
			jsonObjectOut			= new JSONObject();

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			final var	cacheManip	= new CacheManip(request);
			final var	executive				= cacheManip.getExecutive(request);
			getJsonObject 			= new JSONObject(request.getParameter("json"));
			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut			= new ValueObject();
			final var	exSettlementBLL			= new ExcessReceiveSettlementBLL();

			if(request.getParameter("filter") != null)
				filter		= Short.parseShort(request.getParameter("filter"));

			valueObjectIn.put("filter", filter);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			final var	jsobj	= exSettlementBLL.getAllPendingExcessSettlementData(valueObjectIn, valueObjectOut);

			final var	configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_EXCESS_REGISTER_SETTLEMENT);

			jsobj.put("configuration", configuration);

			final var outJsonObject	= JsonUtility.convertionToJsonObjectForResponse(jsobj);

			out.println(outJsonObject);
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
		} finally {
			out.flush();
			out.close();
		}
	}
}

