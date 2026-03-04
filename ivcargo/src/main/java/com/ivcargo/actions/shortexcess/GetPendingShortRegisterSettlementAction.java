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
import com.platform.utils.Utility;

/**
@author Anant Chaudhary	21-11-2015
 *
 */
public class GetPendingShortRegisterSettlementAction implements Action {

	private static final String TRACE_ID = "GetPendingShortRegisterSettlementAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		PrintWriter 					out							= null;
		JSONObject						jsonObjectOut				= null;
		JSONObject						getJsonObject				= null;
		ValueObject						valueObjectOut				= null;
		ValueObject						valueObjectIn				= null;
		Executive						executive					= null;
		ValueObject						branchValObj				= null;
		CacheManip						cacheManip					= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json");

			out 					= response.getWriter();
			jsonObjectOut			= new JSONObject();
			cacheManip				= new CacheManip(request);

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			executive				= cacheManip.getExecutive(request);
			getJsonObject 			= new JSONObject(request.getParameter("json"));
			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut			= new ValueObject();
			final var	shSettlementBLL			= new ShortReceiveSettlementBLL();
			branchValObj 			= cacheManip.getGenericBranchesDetail(request);

			if(request.getParameter("filter") != null)
				filter		= Utility.getShort(request.getParameter("filter"));

			valueObjectIn.put("filter", filter);
			valueObjectIn.put("branchValObj", branchValObj);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("packingTypeForGroup", cacheManip.getPackingTypeMasterData(request));

			final var	configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_SHORT_REGISTER_SETTLEMENT);

			final var	jsobj		= shSettlementBLL.getAllPendingShortSettlementData(valueObjectIn, valueObjectOut);

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
