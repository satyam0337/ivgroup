/**
 *
 */
package com.ivcargo.ajax.sequencecounter;

import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SourceDestinationWiseSequenceCounter;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	19-11-2016
 *
 */
public class TokenWiseLrSequenceAjaxAction implements Action {

	private static final String TRACE_ID = TokenWiseLrSequenceAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
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

			out.println(getTokenWiseLrSequence(request, jsonObjectIn));

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

	private JSONObject getTokenWiseLrSequence(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {

		Executive			executive							= null;
		ValueObject			jsobj								= null;
		ValueObject			valObjIn							= null;
		SequenceCounterBLL	sequenceCounterBll					= null;
		JSONObject 			object 								= null;
		CacheManip			cache								= null;
		Branch				destbranch							= null;
		ValueObject			groupConfiguration					= null;
		int					sourceDestinationWiseWayBillNumberGenerationLevel = 0;
		boolean				subRegionWiseSourceDestinationWiseSequence	= false;
		String				branchIdsForSubRegionWiseSourceDestinationWiseSequence = null;
		List<Long>   		branchListForSubRegionWiseSourceDestinationWiseSequence	= null;

		try {

			sequenceCounterBll	= new SequenceCounterBLL();
			cache				= new CacheManip(request);
			executive		    = cache.getExecutive(request);

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			groupConfiguration	= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			destbranch 			= cache.getBranchById(request, executive.getAccountGroupId(), valObjIn.getLong(Constant.DESTINATION_BRANCH_ID));

			sourceDestinationWiseWayBillNumberGenerationLevel			= groupConfiguration.getInt(GroupConfigurationPropertiesDTO.SOURCE_DESTINATION_WISE_WAY_BILL_NUMBER_GENERATION_LEVEL, 0);
			subRegionWiseSourceDestinationWiseSequence					= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.SUB_REION_WISE_SOURCE_DESTINATION_WISE_SEQUENCE, false);
			branchIdsForSubRegionWiseSourceDestinationWiseSequence		= groupConfiguration.getString(GroupConfigurationPropertiesDTO.BRANCH_IDS_FOR_SUBREGION_WISE_SOURCE_DESTINATION_WISE_SEQUENCE, "");

			if(subRegionWiseSourceDestinationWiseSequence &&
					branchIdsForSubRegionWiseSourceDestinationWiseSequence != null && !branchIdsForSubRegionWiseSourceDestinationWiseSequence.isEmpty()) {
				branchListForSubRegionWiseSourceDestinationWiseSequence		= CollectionUtility.getLongListFromString(branchIdsForSubRegionWiseSourceDestinationWiseSequence);

				if(branchListForSubRegionWiseSourceDestinationWiseSequence.contains(executive.getBranchId()))
					sourceDestinationWiseWayBillNumberGenerationLevel			= SourceDestinationWiseSequenceCounter.SOURCE_REGION_SOURCE_SUBREGION_SOURCE_BRANCH_DESTINATION_REGION_DESTINATION_SUBREGION_LEVEL;
			}

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("destbranch", destbranch);
			valObjIn.put("sourceDestinationWiseWayBillNumberGenerationLevel", sourceDestinationWiseWayBillNumberGenerationLevel);

			if(sourceDestinationWiseWayBillNumberGenerationLevel > 0)
				jsobj = sequenceCounterBll.getSourceDestWiseTokenWiseLrSequence(valObjIn);
			else
				jsobj = sequenceCounterBll.getTokenWiseLrSequence(valObjIn);

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
