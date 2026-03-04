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
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

public class BookingTypeWiseSeqCounterAjaxAction implements Action {

	private static final String TRACE_ID = BookingTypeWiseSeqCounterAjaxAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response){

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

			out.println(getBookingTypeWiseLrSequence(request, jsonObjectIn));

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
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject getBookingTypeWiseLrSequence(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {

		Executive			executive							= null;
		ValueObject			jsobj								= null;
		ValueObject			valObjIn							= null;
		SequenceCounterBLL	sequenceCounterBll					= null;
		JSONObject 			object 								= null;
		CacheManip			cache								= null;
		Branch				branch								= null;
		ValueObject			configuration						= null;


		try {

			executive		    = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			sequenceCounterBll	= new SequenceCounterBLL();

			cache				= new CacheManip(request);
			configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			branch	 			= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branch", branch);
			valObjIn.put(GroupConfigurationPropertiesDTO.IS_BOOKING_TYPE_FTL_WISE_SEQUENCE_COUNTER, configuration.getBoolean(GroupConfigurationPropertiesDTO.IS_BOOKING_TYPE_FTL_WISE_SEQUENCE_COUNTER,false));

			jsobj = sequenceCounterBll.getBookingTypeWiseLrSequence(valObjIn);

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
		} finally {
			executive							= null;
			jsobj								= null;
			valObjIn							= null;
		}
	}
}