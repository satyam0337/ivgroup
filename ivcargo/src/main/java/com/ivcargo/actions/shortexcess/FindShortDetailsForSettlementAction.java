/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	02-11-2015
 *
 */
public class FindShortDetailsForSettlementAction implements Action {

	private static final String TRACE_ID = "FindShortReceiveDetailAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectOut				= null;
		JSONObject						getJsonObject				= null;
		ValueObject						valueObjectOut				= null;
		ValueObject						valueObjectIn				= null;
		ShortReceiveSettlementBLL		shortReceiveBLL				= null;
		Executive						executive					= null;

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
			executive		= cacheManip.getExecutive(request);

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			valueObjectIn		= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut		= new ValueObject();
			shortReceiveBLL		= new ShortReceiveSettlementBLL();

			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			final var	jsobj				= shortReceiveBLL.getShortDetailsForSettlement(valueObjectIn, valueObjectOut);

			final var	configuration	= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_REGISTER_SETTLEMENT);

			jsobj.put("configuration", configuration);

			final var outJsonObject	= JsonUtility.convertionToJsonObjectForResponse(jsobj);

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
