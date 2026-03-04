/**
 *
 */
package com.ivcargo.ajax.sequencecounter;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	19-11-2016
 *
 */
public class ManualLrSequenceOnBillSelectionAjaxAction implements Action {

	private static final String TRACE_ID = ManualLrSequenceOnBillSelectionAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
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

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(getManualLrSequenceOnBillSelection(request, jsonObjectIn));

		} catch (final Exception e1) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				ExceptionProcess.execute(e, TRACE_ID);
			}

			if(out != null) out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	/*
	 * New Method For Getting Manual Lr Sequence Counter
	 */

	private JSONObject getManualLrSequenceOnBillSelection(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {

		ValueObject			jsobj								= null;
		JSONObject 			object 								= null;

		try {
			final var	cache				= new CacheManip(request);
			final var	executive		    = cache.getExecutive(request);
			final var	sequenceCounterBll	= new SequenceCounterBLL();
			final var	configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	branchMod 			= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branchMod", branchMod);
			valObjIn.put("configuration", configuration);

			if(configuration.getBoolean(GroupConfigurationPropertiesDTO.LR_SEQUENCE_ON_BILL_SELECTION, false))
				jsobj = sequenceCounterBll.getLRSequenceOnBillSelection(valObjIn);
			else
				jsobj = sequenceCounterBll.getManualLrSequenceOnBillSelection(valObjIn);

			if(jsobj == null) {
				object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
