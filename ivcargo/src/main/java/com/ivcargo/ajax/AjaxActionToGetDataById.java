/**
 *  author Ashish Tiwari 16/04/2016
 */
package com.ivcargo.ajax;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.DriverMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class AjaxActionToGetDataById implements Action {

	public static final String TRACE_ID = "AjaxActionToGetDataById";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(populateSubRegionByRegionId(request, jsonObjectOut, jsonObjectIn));
			case 2 -> out.println(getBranchById(request, jsonObjectOut, jsonObjectIn));
			case 3 -> out.println(getDriverDetailsById(jsonObjectOut, jsonObjectIn));
			case 4 -> out.println(populateRegionsByAccountGroupId(request, jsonObjectOut));
			case 5 -> out.println(populateBranchesBySubregionId(request, jsonObjectOut, jsonObjectIn));
			case 6 -> out.println(populateSubRegionsByAccountGroupId(request, jsonObjectOut));
			case 7 -> out.println(populateRegionSubregionBranchesByExecutiveType(request, jsonObjectOut, jsonObjectIn));
			case 8 -> out.println(populateAssignedLocationByLocationId(request, jsonObjectOut, jsonObjectIn));
			default -> {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e1, TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject populateSubRegionByRegionId(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	regionId			= Utility.getLong(jsonObjectIn.get("regionId"));

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			valObjOut.put("subRegions", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId())));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getBranchById(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	destId				= Utility.getLong(jsonObjectIn.get("DestId"));

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			final var	branch 				= cache.getBranchById(request, executive.getAccountGroupId(), destId);

			valObjOut.put("branch", Converter.DtoToHashMap(branch));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDriverDetailsById(final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut		= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	driverId		= jsonObjectIn.getLong("driverId");

			final var	driverMaster	= DriverMasterDao.getInstance().findByDriverId(driverId);

			if(driverMaster != null)
				valObjOut.put("driverMaster", driverMaster);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject populateRegionsByAccountGroupId(final HttpServletRequest request, final JSONObject jsonObjectOut) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			valObjOut.put("groupRegions", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getRegionsByGroupId(request, executive.getAccountGroupId())));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject populateSubRegionsByAccountGroupId(final HttpServletRequest request, final JSONObject jsonObjectOut) throws Exception {
		List<SubRegion>			grupSubRegionMergingArr		= null;

		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	cache						= new CacheManip(request);
			final var	executive					= cache.getExecutive(request);
			final var	receiveConfig				= cache.getReceiveConfiguration(request, executive.getAccountGroupId());
			final var	isRecieveWithMergingBranch 	= (Boolean) receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_WITH_MERGING_BRANCHES,false);
			final var	grupSubRegionArr 			= cache.getSubRegionsByGroupId(request, executive.getAccountGroupId());

			if(isRecieveWithMergingBranch)
				grupSubRegionMergingArr = cache.getSubRegionWithMergingByAccountGroupId(request, executive.getAccountGroupId());

			final List<SubRegion>	finalSubregionArr		= new ArrayList<>(Arrays.asList(grupSubRegionArr));

			if(grupSubRegionMergingArr != null)
				finalSubregionArr.addAll(grupSubRegionMergingArr);

			valObjOut.put("grupSubRegionArr", finalSubregionArr);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject populateRegionSubregionBranchesByExecutiveType(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	showRegionSelectionForRegionAdmin		= jsonObjectIn.optBoolean("showRegionSelectionForRegionAdmin", false);
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || showRegionSelectionForRegionAdmin)
				valObjOut.put("regionForGroup", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getRegionsByGroupId(request, executive.getAccountGroupId())));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				valObjOut.put("subRegionForGroup", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId())));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				final var	execBranch 				= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

				valObjOut.put("subRegionBranches", Converter.hashMapWithDtoToHashMapConversion(cache.getBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId())));
			} else
				valObjOut.put("locationMappingList", Converter.dtoArrayListtoArrayListWithHashMapConversion(cache.getAssignedLocationsByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId())));

			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(executive));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject populateAssignedLocationByLocationId(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			final var	locationId			= Utility.getLong(jsonObjectIn.get("branchId"));

			final var	locationMappingList = cache.getAssignedLocationsByLocationIdId(request, locationId, executive.getAccountGroupId());

			valObjOut.put("locationMappingList", Converter.dtoArrayListtoArrayListWithHashMapConversion(locationMappingList));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject populateBranchesBySubregionId(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	subRegionId			= Utility.getLong(jsonObjectIn.get("subRegionId"));

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			final var	subRegionBranches	= cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);

			valObjOut.put("subRegionBranches", Converter.arrayDtotoArrayListWithHashMapConversion(subRegionBranches));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
