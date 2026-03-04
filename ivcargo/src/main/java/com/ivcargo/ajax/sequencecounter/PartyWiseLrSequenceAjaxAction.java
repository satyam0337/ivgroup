package com.ivcargo.ajax.sequencecounter;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.resource.CargoErrorList;

public class PartyWiseLrSequenceAjaxAction  implements Action  {

	private static final String TRACE_ID =  PartyWiseLrSequenceAjaxAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(getPartyWiseLrSequence(request, jsonObjectIn));

		} catch (final Exception e1) {
			ExceptionProcess.execute(e1, TRACE_ID);

			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
				e.printStackTrace();
			}

			if(out != null)
				out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}

	}

	private JSONObject getPartyWiseLrSequence(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	cache				= new CacheManip(request);
			final var	executive		    = cache.getExecutive(request);
			final var	branch	 			= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

			final var configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("branch", branch);

			final var	sequenceCounterBll	= new SequenceCounterBLL();
			final var	jsobj = sequenceCounterBll.getPartyWiseLrSequence(valObjIn, configuration);

			if(jsobj == null) {
				final var	object	= new JSONObject();
				object.put("partyWiseSequence", false);
				return object;
			}

			final var	object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			object.put("partyWiseSequence", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
