package com.ivcargo.actions.masters;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.businesslogic.master.CorporatePartyDetailsBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroup;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	29-02-2016
 *
 */

public class CorporatePartyDetailsAjaxAction implements Action {

	public static final String TRACE_ID	= "PartyDetailsAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter 				out							= null;
		JSONObject          		jsonObjectOut   			= null;
		JSONObject    				jsonObjectGet  				= null;
		ValueObject					valueObjectId				= null;
		var       					branchId					= 0L;
		var       					regionId	    			= 0L;
		var       					subregionId	    			= 0L;
		Executive					executive 	    			= null;
		var 						accountGroupId				= 0L;
		AccountGroup				accountGroup				= null;
		ValueObject         		valueOutbject  				= null;
		CacheManip          		cacheObj	    			= null;
		ValueObject					cityObject					= null;
		ValueObject					branchesObject				= null;
		ValueObject					branchObject				= null;
		ValueObject					regionObject				= null;
		ValueObject					subregionObject				= null;
		String						branchname					= null;
		String 						regionName					= null;
		String 						subRegionName				= null;
		CorporatePartyDetailsBLL	corporatePartyDetailsBLL	= null;
		ValueObject					configuration				= null;

		try {
			response.setContentType("application/json");//setting response for ajax

			jsonObjectOut				= new JSONObject();

			jsonObjectGet	            = new JSONObject(request.getParameter("json"));
			out							= response.getWriter();

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			branchId 					= Utility.getLong(jsonObjectGet.get("BranchID"));
			regionId 					= Utility.getLong(jsonObjectGet.get("RegionID"));
			subregionId 				= Utility.getLong(jsonObjectGet.get("SubRegionID"));

			cacheObj					= new CacheManip(request);
			executive 					= cacheObj.getExecutive(request);

			accountGroupId				= executive.getAccountGroupId();

			corporatePartyDetailsBLL	= new CorporatePartyDetailsBLL();

			valueObjectId				= new ValueObject();
			branchObject				= new ValueObject();
			regionObject				= new ValueObject();
			subregionObject				= new ValueObject();

			valueOutbject				= new ValueObject();
			branchesObject				= new ValueObject();

			branchObject.put("branch", cacheObj.getBranchById(request, accountGroupId, branchId));
			regionObject.put("region", cacheObj.getRegionByIdAndGroupId(request, regionId, accountGroupId));
			subregionObject.put("subRegion", cacheObj.getGenericSubRegionById(request, subregionId));
			accountGroup				= cacheObj.getAccountGroupByAccountGroupId(request, accountGroupId);

			branchname					= corporatePartyDetailsBLL.getBranchName(branchId, branchObject);
			regionName					= corporatePartyDetailsBLL.getRegionName(regionId, regionObject);
			subRegionName				= corporatePartyDetailsBLL.getSubRegionName(subregionId, subregionObject);

			cityObject					= cacheObj.getCityData(request);

			valueObjectId.put("regionId", regionId);
			valueObjectId.put("subregionId", subregionId);
			valueObjectId.put("branchId", branchId);
			valueObjectId.put("accountGroupId", accountGroupId);

			branchesObject.put("branchesColl", cacheObj.getAllGroupBranches(request, executive.getAccountGroupId()));

			final var	corporateAccountArr			= corporatePartyDetailsBLL.getCorporatePartyData(valueObjectId, cityObject, branchesObject);//get data

			if(ObjectUtils.isEmpty(corporateAccountArr)) {
				jsonObjectOut.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				return;
			}

			valueOutbject.put("partylist", Converter.dtoListtoListWithHashMapConversion(corporateAccountArr));
			valueOutbject.put("branchName", branchname);
			valueOutbject.put("regionName", regionName);
			valueOutbject.put("subRegionName", subRegionName);
			valueOutbject.put("groupName", accountGroup.getDescription());

			configuration				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_DETAILS_CONFIG);

			valueOutbject.put("configuration", configuration);

			jsonObjectOut				= JsonUtility.convertionToJsonObjectForResponse(valueOutbject);

			out.println(jsonObjectOut);

		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception ee) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "" + ee);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}
}
