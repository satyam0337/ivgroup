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
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.SourceDestinationWiseSequenceCounter;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	19-11-2016
 *
 */
public class CheckSourceDestinationWiseSequenceAjaxAction implements Action {

	private static final String TRACE_ID = CheckSourceDestinationWiseSequenceAjaxAction.class.getName();

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

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(checkSourceAndDestinationWiseWayBillNumber(request, jsonObjectIn));

		} catch (final Exception e1) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
				e.printStackTrace();
			}
			if(out != null) out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject checkSourceAndDestinationWiseWayBillNumber(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		short	 						billSelection  				= 0;

		try {
			final var	destBranchId		= Long.parseLong(jsonObjectIn.get("destBranchId").toString());

			if (!jsonObjectIn.isNull("billSelection"))
				billSelection		= Short.parseShort(jsonObjectIn.get("billSelection").toString());

			final var	cache			    = new CacheManip(request);
			final var	executive		    = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	sourceBranch		= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final var	destinationBranch	= cache.getGenericBranchDetailCache(request, destBranchId);
			final var	configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	inValueObject		= new ValueObject();

			inValueObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			inValueObject.put(Constant.SOURCE_REGION_ID, sourceBranch.getRegionId());
			inValueObject.put(Constant.SOURCE_SUB_REGION_ID, sourceBranch.getSubRegionId());
			inValueObject.put(Constant.SOURCE_BRANCH_ID, sourceBranch.getBranchId());
			inValueObject.put(Constant.SOURCE_CITY_ID, sourceBranch.getCityId());
			inValueObject.put(Constant.DESTINATION_REGION_ID, destinationBranch.getRegionId());
			inValueObject.put(Constant.DESTINATION_SUB_REGION_ID, destinationBranch.getSubRegionId());
			inValueObject.put(Constant.DESTINATION_CITY_ID, destinationBranch.getCityId());
			inValueObject.put(Constant.DESTINATION_BRANCH_ID, destinationBranch.getBranchId());
			inValueObject.put("sequenceLevel", configuration.getInt(GroupConfigurationPropertiesDTO.SOURCE_DESTINATION_WISE_WAY_BILL_NUMBER_GENERATION_LEVEL, 0));
			inValueObject.put(Constant.BILL_SELECTION_ID, billSelection);
			inValueObject.put("branchCode", sourceBranch.getBranchCode());
			inValueObject.put(GroupConfigurationPropertiesDTO.BRANCH_CODE_WISE_WAY_BILL_NUMBER_GENERATION, configuration.getBoolean(GroupConfigurationPropertiesDTO.BRANCH_CODE_WISE_WAY_BILL_NUMBER_GENERATION, true));
			inValueObject.put(Constant.FILTER, SourceDestinationWiseSequenceCounter.SOURCE_DESTINATION_WISE_SEQUENCE_CHECK);
			inValueObject.put(GroupConfigurationPropertiesDTO.SOURCE_AND_DESTINATION_WISE_SEQUENCE_AUTOMATIC_RESET, configuration.getBoolean(GroupConfigurationPropertiesDTO.SOURCE_AND_DESTINATION_WISE_SEQUENCE_AUTOMATIC_RESET, false));
			inValueObject.put(GroupConfigurationPropertiesConstant.ALLOW_SRC_DEST_WISE_SEQ_FOR_BILL_AND_WITHOUT_BILL, configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_SRC_DEST_WISE_SEQ_FOR_BILL_AND_WITHOUT_BILL, false));

			final var	sequenceBll	   = new SequenceCounterBLL();
			final var	outValueObject = sequenceBll.checkSourceAndDestinationWiseWayBillNumber(inValueObject);
			outValueObject.put("destinationBranch", destinationBranch);

			return JsonUtility.convertionToJsonObjectForResponse(outValueObject);
		}  catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
