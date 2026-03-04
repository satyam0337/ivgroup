/**
 *
 */
package com.ivcargo.ajax.autocomplete;

import java.io.PrintWriter;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.GroupConfigurationProperties;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

/**
 * @author Administrator
 *
 */
public class DestinationBranchAutoCompleteForAjaxAction implements Action {

	private static final String TRACE_ID = DestinationBranchAutoCompleteForAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		PrintWriter		out				= null;
		JSONObject		jsonObjectOut	= null;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out				= response.getWriter();

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LOGGED_OUT_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			out.println(destinationBranchAutoComplete(request, response));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}
			if(out != null) out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	/*
	 * recreated in DestinationBranchAutocompleteBllImpl.java
	 * as getDeliveryPointDestinationBranch()
	 */
	private JSONArray destinationBranchAutoComplete(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		JSONObject					jObject							= null;
		JSONArray					jArray							= null;
		var							destSubRegionId					= 0L;
		var						branchAutoSaveForFtl			= false;

		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			final Map<String, String>	destList2			= new TreeMap<>();

			response.setContentType("application/json"); // Setting response for JSON Content

			jArray				= new JSONArray();

			if(executive != null) {
				final var	groupConfig									= cache.getGroupConfiguration(request, executive.getAccountGroupId());
				final var	branchColl 									= cache.getGenericBranchesDetail(request);

				final var	isShowAccountGroupwithBranch				= PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SHOW_ACCOUNTGROUP_IN_BRANCH_AUTOCOMPLETE_ON_BOOKING_PAGE)+"");
				final var	setAutocompleteOnInitialChar				= PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SET_AUTOCOMPLETE_ON_INITIAL_CHAR)+"");
				final var	hideDestinationBookingRegionsToBranch 		= PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SOURCE_REGION_TO_DESTINATION_BRANCH_BOOKING_LOACKING)+"");
				final var	showSubRegionwiseDestinationBranchField 	= PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SHOW_SUBREGION_WISE_DESTINATION_BRANCH_FIELD)+"");
				final var	isDestinationCityWithBranches				= groupConfig.getBoolean(GroupConfigurationPropertiesDTO.IS_DESTINATION_CITY_WITH_BRANCHES, false);
				final var	allowSrcBranchToDestSubRegionBooking 		= groupConfig.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_SOURCE_BRANCH_TO_DESTINATION_SUB_REGION_BOOKING, false);
				final var	blockSrcBranchToDestSubRegionBooking		= groupConfig.getBoolean(GroupConfigurationPropertiesConstant.BLOCK_SOURCE_BRANCH_TO_DESTINATION_SUB_REGION_BOOKING, false);

				if(request.getParameter(Constant.AUTOCOMPLETE_REQUEST_PARAM) != null) {
					final var	strQry 	= request.getParameter(Constant.AUTOCOMPLETE_REQUEST_PARAM);

					final var	isOwnBranchRequired 					= JSPUtility.GetBoolean(request, "isOwnBranchRequired", true);
					final var	isOwnBranchWithLocationsRequired		= JSPUtility.GetBoolean(request, "isOwnBranchWithLocationsRequired", true);
					final var	isOwnGroupBranchesRequired 				= JSPUtility.GetBoolean(request, "IsOwnGroupBranchesRequired", false);
					final var	isBranchNetworkConfig 					= JSPUtility.GetBoolean(request, "branchNetworkConfiguration", false);
					final var	doNotAllowSameCityBranchesInDestination	= JSPUtility.GetBoolean(request, "doNotAllowSameCityBranchesInDestination", false);

					branchAutoSaveForFtl = JSPUtility.GetBoolean(request, "branchAutoSaveForFtl", false);

					final var	locationId				= JSPUtility.GetLong(request, "locationId", 0);
					final var	branchType				= JSPUtility.GetShort(request, "branchType", (short) 3);
					final var	deliveryDestinationBy	= JSPUtility.GetShort(request, "deliveryDestinationBy", (short) 0);
					final var	destinationSubRegionId 	= JSPUtility.GetLong(request, "destinationSubRegionId", 0);

					final var	branch 						= cache.getBranchById(request, executive.getAccountGroupId(), locationId);

					var	destListination		= cache.getDestinationBranchWithSubregionWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired);

					if(showSubRegionwiseDestinationBranchField && destinationSubRegionId > 0)
						destListination     = cache.getAllPhysicalAndOperationalDestinationBySubRgionBranches(request, strQry, executive.getAccountGroupId(), destinationSubRegionId);
					else if(!isBranchNetworkConfig)
						switch (deliveryDestinationBy) {
						case Branch.DELIVERY_DESTINATION_WITHOUT_SUBREGION -> destListination	= cache.getBranchAndCityWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired,setAutocompleteOnInitialChar);
						case Branch.DELIVERY_DESTINATION_WITH_SUBREGION -> destListination	= cache.getDestinationBranchWithSubregionWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired);
						case Branch.DELIVERY_DESTINATION_WITH_CITY -> destListination	= cache.getDestinationBranchWithCityWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired, isDestinationCityWithBranches);
						case Branch.DELIVERY_DESTINATION_WITH_PINCODE -> destListination	= cache.getDestinationBranchWithPinCodeWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired);
						default -> {
							break;
						}
						}
					else
						switch (deliveryDestinationBy) {
						case Branch.DELIVERY_DESTINATION_WITHOUT_SUBREGION -> destListination	= cache.getDestinationBranchListByBranchName(request, strQry, locationId);
						case Branch.DELIVERY_DESTINATION_WITH_SUBREGION -> destListination	= cache.getDestinationBranchListByBranchAndSubregionName(request, strQry, locationId);
						case Branch.DELIVERY_DESTINATION_WITH_CITY -> destListination	= cache.getDestinationBranchListByBranchAndCityName(request, strQry, locationId , isDestinationCityWithBranches);
						case Branch.DELIVERY_DESTINATION_WITH_PINCODE -> destListination	= cache.getDestinationBranchListByBranchAndPinCode(request, strQry, locationId);
						default -> {
							break;
						}
						}

					if(isShowAccountGroupwithBranch) {
						for(final Map.Entry<String, String> entry : destListination.entrySet()) {
							final var	branchCityMapSlipted 	= entry.getValue().split("_");

							if(branchCityMapSlipted[4] != null) {
								final var	groupId				= Long.parseLong(branchCityMapSlipted[4]);

								final var	accountGroup 		= cache.getAccountGroupByAccountGroupId(request, groupId);
								destList2.put(entry.getKey() + " (" + accountGroup.getAccountGroupCode() + ")", entry.getValue());
							}
						}

						destListination.clear();
						destListination.putAll(destList2);
					}

					final var	assignedLocations	= cache.getAssignedLocationsIdListByLocationIdId(request, locationId, executive.getAccountGroupId());

					if (destListination != null && !destListination.isEmpty() )
						for(final Map.Entry<String, String> entry : destListination.entrySet()) {
							var			isBranchAllowed			= true;
							final var	branchCityMap			= entry.getValue();
							final var	branchCityMapSlipted	= branchCityMap.split("_");
							final var	branchId				= Long.parseLong(branchCityMapSlipted[0]);
							final var	destCityId				= Long.parseLong(branchCityMapSlipted[1]);
							final var	destinationBranch 		= (Branch) branchColl.get(Long.toString(branchId));

							if(destinationBranch != null)
								destSubRegionId			= destinationBranch.getSubRegionId();

							if(!isOwnBranchWithLocationsRequired)
								for (final Long assignedLocation : assignedLocations)
									if(assignedLocation == branchId)
										isBranchAllowed = false;

							if(!isOwnBranchRequired && executive.getBranchId() == branchId)
								isBranchAllowed = false;

							if(hideDestinationBookingRegionsToBranch && branch != null)
								isBranchAllowed = sourceRegionToDestinationBranchBookingLocking(branchId, groupConfig, branch.getRegionId());

							if(isBranchAllowed && allowSrcBranchToDestSubRegionBooking)
								isBranchAllowed = sourceBranchToDestinationSubRegionBookingAllow(groupConfig, executive.getBranchId(), destSubRegionId);

							if(isBranchAllowed && blockSrcBranchToDestSubRegionBooking)
								isBranchAllowed = sourceBranchToDestinationSubRegionBookingLocking(groupConfig, executive.getBranchId(), destSubRegionId);

							if(doNotAllowSameCityBranchesInDestination && branch.getCityId() == destCityId)
								isBranchAllowed = false;

							if(!isBranchAllowed)
								continue;

							jObject	= new JSONObject();

							jObject.put(Constant.AUTOCOMPLETE_LABEL, entry.getKey());
							jObject.put(Constant.AUTOCOMPLETE_ID, entry.getValue());
							jArray.put(jObject);
						}
					else if(!branchAutoSaveForFtl){
						jObject = new JSONObject();
						jObject.put(Constant.AUTOCOMPLETE_LABEL, CargoErrorList.NO_RECORDS_DESCRIPTION);
						jObject.put(Constant.AUTOCOMPLETE_ID, "0");
						jArray.put(jObject);
					}
				}
			} else {
				jObject	= new JSONObject();
				jObject.put(Constant.AUTOCOMPLETE_LABEL, "You are logged out, Please login again !");
				jObject.put(Constant.AUTOCOMPLETE_ID, "0");
				jArray.put(jObject);
			}

			if(jArray.length() < 1 && !branchAutoSaveForFtl)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			jObject		= new JSONObject();
			jObject.put(Constant.AUTOCOMPLETE_LABEL, "Some Error occoured While Fetching !");
			jObject.put(Constant.AUTOCOMPLETE_ID, "0");
			jArray.put(jObject);
			return jArray;
		}
	}

	private JSONObject setAutocompleteResponse(final HttpServletRequest request) throws Exception {
		JSONObject	jObject		= null;

		try {
			jObject	= new JSONObject();

			jObject.put(Constant.AUTOCOMPLETE_ID, "0");

			if(request.getParameter("responseFilter") != null) {
				final var resType = Short.parseShort(request.getParameter("responseFilter"));

				switch (resType) {
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD -> jObject.put(Constant.AUTOCOMPLETE_LABEL, "No Record Found");
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_SAMEDATA -> jObject.put(Constant.AUTOCOMPLETE_LABEL, request.getParameter(Constant.AUTOCOMPLETE_REQUEST_PARAM) + " (New)");
				default -> jObject.put(Constant.AUTOCOMPLETE_LABEL, "No Record Found");
				}
			}

			return jObject;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			jObject	= new JSONObject();
			jObject.put(Constant.AUTOCOMPLETE_LABEL,"Some Error occoured While Fetching.");
			jObject.put(Constant.AUTOCOMPLETE_ID,"0");
			return jObject;
		}
	}

	// this is sourceRegionIds to destination branch locking.
	// branch does'nt show on destination autocomplete.
	// this method done on falcon group
	// source REgions to destination branch locking.
	private boolean sourceRegionToDestinationBranchBookingLocking(final long branchId, final ValueObject groupConfig, final long regionId) throws Exception {
		try {
			final var	hideRegionIDsAndBranchId 	= CollectionUtility.getLongWithLongHashMapFromStringArray(groupConfig.getString(GroupConfigurationPropertiesConstant.HIDE_REGION_IDS_AND_BRANCHID, "0"), Constant.COMMA);

			if(hideRegionIDsAndBranchId != null && !hideRegionIDsAndBranchId.isEmpty() && hideRegionIDsAndBranchId.containsKey(regionId))
				return !hideRegionIDsAndBranchId.get(regionId).contains(branchId);

			return true;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean sourceBranchToDestinationSubRegionBookingAllow(final ValueObject groupConfig, final long srcBranchId, final long destSubRegionId) throws Exception {
		try {
			final var	srcAndDestRegionWiseArray 		= CollectionUtility.getLongWithLongHashMapFromStringArray(groupConfig.getString(GroupConfigurationPropertiesConstant.SRC_BRANCH_AND_DEST_SUB_REGION_IDS_TO_ALLOW_BOOKING, "0"), Constant.COMMA);

			if(srcAndDestRegionWiseArray != null && !srcAndDestRegionWiseArray.isEmpty() && srcAndDestRegionWiseArray.containsKey(srcBranchId))
				return srcAndDestRegionWiseArray.get(srcBranchId).contains(destSubRegionId);

			return true;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean sourceBranchToDestinationSubRegionBookingLocking(final ValueObject groupConfig, final long srcBranchId, final long destSubRegionId) throws Exception {
		try {
			final var srcAndDestRegionWiseArrays = CollectionUtility.getLongWithLongHashMapFromStringArray(groupConfig.getString(GroupConfigurationPropertiesConstant.SRC_BRANCH_AND_DEST_SUB_REGION_IDS_TO_BLOCK_BOOKING, "0"), Constant.COMMA);

			if (srcAndDestRegionWiseArrays != null && !srcAndDestRegionWiseArrays.isEmpty() && srcAndDestRegionWiseArrays.containsKey(srcBranchId))
				return !srcAndDestRegionWiseArrays.get(srcBranchId).contains(destSubRegionId);

			return true;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}