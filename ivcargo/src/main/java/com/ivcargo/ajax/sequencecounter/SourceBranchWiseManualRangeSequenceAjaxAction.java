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
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.dto.constant.SequenceTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SequenceCounter;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	19-11-2016
 *
 */
public class SourceBranchWiseManualRangeSequenceAjaxAction implements Action {

	private static final String TRACE_ID = SourceBranchWiseManualRangeSequenceAjaxAction.class.getName();
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

			out.println(getManualLrSequence(request, jsonObjectIn));

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

	/*
	 * New Method For Getting Manual Lr Sequence Counter
	 */

	private JSONObject getManualLrSequence(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		ValueObject			jsobj								= null;
		Branch				handlingBranch						= null;

		try {
			final var	cacheManip			= new CacheManip(request);
			final var	executive		    = cacheManip.getExecutive(request);
			final var	sequenceCounterBll	= new SequenceCounterBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	branch 				= cacheManip.getGenericBranchDetailCache(request, Utility.getLong(valObjIn.get(Constant.SOURCE_BRANCH_ID)));

			if(branch == null) {
				final var	object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			final var	confValObj 			= cacheManip.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	operationalBranchWiseLRSeqCounter	= confValObj.getBoolean(GroupConfigurationPropertiesConstant.OPERATIONAL_BRANCH_WISE_LR_SEQ_COUNTER, false);
			final var	sequenceType						= valObjIn.getShort(Constant.SEQUENCE_TYPE, SequenceCounter.SEQUENCE_MANUAL);
			final var	subRegionWiseSrcBranchManualLRSeqCounter	= confValObj.getBoolean(GroupConfigurationPropertiesConstant.SUB_REGION_WISE_SOURCE_BRANCH_MANUAL_LR_SEQ_COUNTER, false);
			final var handlingBranchWiseManualRangeSequenceCounter	= confValObj.getBoolean(GroupConfigurationPropertiesConstant.HANDLING_BRANCH_WISE_MANUAL_RANGE_SEQUENCE_COUNTER, false);

			if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
				if(operationalBranchWiseLRSeqCounter)
					valObjIn.put(GroupConfigurationPropertiesConstant.OPERATIONAL_BRANCH_WISE_LR_SEQ_COUNTER, CollectionUtility.getLongListFromString(confValObj.getString(GroupConfigurationPropertiesConstant.BRANCH_IDS_FOR_OPERATIONAL_BRANCH_SEQUENCE, null)).contains(branch.getBranchId()));
				else if(handlingBranchWiseManualRangeSequenceCounter && sequenceType == SequenceTypeConstant.SEQUENCE_AUTO_ID) {
					handlingBranch	= cacheManip.getGenericBranchDetailCache(request, branch.getHandlingBranchId());

					if(handlingBranch != null)
						valObjIn.put("handlingBranch", handlingBranch);
				}else if(subRegionWiseSrcBranchManualLRSeqCounter)
					valObjIn.put(GroupConfigurationPropertiesConstant.SUB_REGION_WISE_SOURCE_BRANCH_MANUAL_LR_SEQ_COUNTER, CollectionUtility.getLongListFromString(confValObj.getString(GroupConfigurationPropertiesConstant.SUB_REGION_IDS_FOR_SOURCE_BRANCH_MANUAL_LR_SEQ, null)).contains(branch.getSubRegionId()));


			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(Branch.BRANCH, branch);
			valObjIn.put(Constant.SEQUENCE_TYPE, sequenceType);
			valObjIn.put(GroupConfigurationPropertiesConstant.HANDLING_BRANCH_WISE_MANUAL_RANGE_SEQUENCE_COUNTER, handlingBranchWiseManualRangeSequenceCounter);

			jsobj = sequenceCounterBll.getSourceBranchWiseManualLrSeqCounter(valObjIn);

			if(jsobj != null)
				if(handlingBranchWiseManualRangeSequenceCounter && handlingBranch != null)
					jsobj.put("branchCode", handlingBranch.getBranchCode());
				else
					jsobj.put("branchCode", branch.getBranchCode());

			if(jsobj == null) {
				final var	object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			final var	object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
