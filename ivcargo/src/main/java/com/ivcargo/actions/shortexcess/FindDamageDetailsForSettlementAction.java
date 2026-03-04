/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.DamageReceiveSettlementBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.resource.CargoErrorList;

/**
 * @author Shailesh Khandare	19-01-2016
 *
 */
public class FindDamageDetailsForSettlementAction implements Action {

	private static final String TRACE_ID = "FindDamageDetailsForSettlementAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectOut				= null;

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
			final var	executive		= cacheManip.getExecutive(request);

			final var	getJsonObject 		= new JSONObject(request.getParameter("json"));
			final var	valueObjectIn		= JsonUtility.convertJsontoValueObject(getJsonObject);
			final var	valueObjectOut		= new ValueObject();
			final var	damageReceiveBLL	= new DamageReceiveSettlementBLL();

			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			final var	jsobj					= damageReceiveBLL.getDamageDetailsForSettlement(valueObjectIn, valueObjectOut);

			final var	configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_REGISTER_SETTLEMENT);

			jsobj.put("configuration", configuration);

			final var	outJsonObject	= JsonUtility.convertionToJsonObjectForResponse(jsobj);

			out.println(outJsonObject);
		} catch (final Exception e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e1);
				e1.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}
}
