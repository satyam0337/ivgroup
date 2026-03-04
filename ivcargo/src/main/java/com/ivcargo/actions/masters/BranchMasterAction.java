package com.ivcargo.actions.masters;

import java.io.PrintWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.BranchBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.master.BranchMasterConfigurationConstant;
import com.iv.constant.properties.master.SyncWithIVFleetPropertiesConstant;
import com.iv.constant.properties.master.SyncWithNexusPropertiesConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.BranchDao;
import com.platform.dao.StateDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.resource.CargoErrorList;

public class BranchMasterAction implements Action {

	public static final String TRACE_ID = "BranchMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>		error 						= null;
		String						strResponse					= null;
		var							filter						= 0;
		var							isFtlBooking				= false;
		PrintWriter					out							= null;
		JSONObject					jsonObjectIn				= null;
		JSONObject					jsonObjectOut				= null;

		try {
			response.setContentType("application/json");

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);

			final var	execFldPermissions 	= cache.getExecutiveFieldPermission(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.BRANCHMASTER))
				return;

			final var	exec 		= cache.getExecutive(request);
			final var	allStates 	= StateDao.getInstance().findStatesByAccountGroupId( exec.getAccountGroupId());
			out			= response.getWriter();
			jsonObjectOut			= new JSONObject();

			if(request.getParameter("json") != null)
				jsonObjectIn			= new JSONObject(request.getParameter("json"));

			final var	configuration	= cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_MASTER);

			final var	regions 		= cache.getRegionsByGroupId(request, exec.getAccountGroupId());

			if(ObjectUtils.isEmpty(regions))
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=9");

			final List<Region>	regionsList		= SortUtils.sortList(Arrays.asList(regions), Region::getName);

			final var	allSubRegions	= cache.getSubRegionsByGroupId(request, exec.getAccountGroupId());

			final List<SubRegion>	allSubRegionsList	= SortUtils.sortList(Arrays.asList(allSubRegions), SubRegion::getName);

			if(jsonObjectIn != null) {
				isFtlBooking	= jsonObjectIn.optBoolean("isFTLBookingScreen", false);

				if(isFtlBooking) {
					filter = 1;
					jsonObjectOut.put("isFtlBooking", isFtlBooking);
				}
			} else
				filter 		= JSPUtility.GetInt(request, "filter",0);

			switch (filter) {
			case 1 -> strResponse	= insertBranch(request, exec, jsonObjectIn, jsonObjectOut, configuration);
			case 2 -> strResponse	= updateBranch(request, exec, configuration);
			case 4 -> strResponse	= updateStatus(request, exec, Branch.BRANCH_DEACTIVE, configuration);
			case 5 -> strResponse	= updateStatus(request, exec, Branch.BRANCH_ACTIVE, configuration);
			default -> {
				break;
			}
			}

			final Map<Integer, String>	locationTypeHM = new HashMap<>();

			if((boolean) configuration.getOrDefault(BranchMasterConfigurationConstant.ALLOW_TO_CREATE_PHYSICAL_AND_OPERATIONAL_BRANCH, false)) {
				locationTypeHM.put(Branch.TYPE_OF_LOCATION_PHYSICAL, Branch.STRING_TYPE_OF_LOCATION_PHYSICAL);
				locationTypeHM.put(Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE, Branch.STRING_TYPE_OF_LOCATION_OPERATIONAL_PLACE);
			} else if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_CREATE_PHYSICAL_BRANCH) != null)
				locationTypeHM.put(Branch.TYPE_OF_LOCATION_PHYSICAL, Branch.STRING_TYPE_OF_LOCATION_PHYSICAL);
			else if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_CREATE_OPERATIONAL_BRANCH) != null)
				locationTypeHM.put(Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE, Branch.STRING_TYPE_OF_LOCATION_OPERATIONAL_PLACE);

			request.setAttribute("regions", regionsList);
			request.setAttribute("allStates", allStates);
			request.setAttribute("allSubRegions", allSubRegionsList);
			request.setAttribute("locationTypeHM", locationTypeHM);

			request.setAttribute("showBranchMasterEditLogsDetails", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.SHOW_BRANCH_MASTER_EDIT_LOGS_DETAILS) != null || BooleanUtils.isTrue(exec.getIsSuperUser()));
			request.setAttribute("showManualLRNButtonForAutoBooking", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.BRANCH_PERMISSION_TO_SHOW_MANUAL_LR_NO_ON_AUTO_BOOKING) != null);

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			if((boolean) configuration.getOrDefault(BranchMasterConfigurationConstant.SHOW_BRANCH_SERVICE_TYPE, false))
				request.setAttribute("branchServiceTypeList", BookingWayBillSelectionUtility.getBranchServiceTypeList(configuration, true));

			request.setAttribute("nextPageToken", "success");

			if(filter!= 0 && isFtlBooking)
				out.println(jsonObjectOut);
			else if(filter!= 0 && !isFtlBooking){
				response.sendRedirect("BranchMaster.do?pageId=209&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if(filter == 1 && isFtlBooking && out != null){
				out.flush();
				out.close();
			}
		}
	}

	private void setBranch(final HttpServletRequest request, final ValueObject valueObjectIn) throws Exception {
		try {
			valueObjectIn.put("selectedBranchId", JSPUtility.GetLong(request, "selectedBranchId",0));
			valueObjectIn.put("agency", JSPUtility.GetLong(request, "agency",0));
			valueObjectIn.put("name", StringUtils.upperCase(JSPUtility.GetString(request, "name", "")));
			valueObjectIn.put("address", JSPUtility.GetString(request, "address", " ").replaceAll("\\s+", " ").replace(';', ' '));
			valueObjectIn.put("city", JSPUtility.GetLong(request, "city", 0));
			valueObjectIn.put("state", JSPUtility.GetLong(request, "state", 0));
			valueObjectIn.put("pinCode", JSPUtility.GetLong(request, "pinCode", 0));
			valueObjectIn.put("contactPerson", JSPUtility.GetString(request, "contactPerson", "NA"));
			valueObjectIn.put("phoneNumber1", JSPUtility.GetString(request, "phoneNumber1", null));
			valueObjectIn.put("mobileNumber1", JSPUtility.GetString(request, "mobileNumber1", null));
			valueObjectIn.put("phoneNumber2", JSPUtility.GetString(request, "phoneNumber2", null));
			valueObjectIn.put("mobileNumber2", JSPUtility.GetString(request, "mobileNumber2", null));
			valueObjectIn.put("faxNumber", JSPUtility.GetString(request, "faxNumber", null));
			valueObjectIn.put("emailAddress", JSPUtility.GetString(request, "emailAddress", null));
			valueObjectIn.put("branchType", JSPUtility.GetInt(request, "branchType", 0));
			valueObjectIn.put("region", JSPUtility.GetLong(request, "region", 0));
			valueObjectIn.put("subRegion", JSPUtility.GetLong(request, "subRegion", 0));

			if(request.getParameter("isDeliveryPlace") != null)
				valueObjectIn.put("isDeliveryPlace", request.getParameter("isDeliveryPlace"));

			if(request.getParameter("isAgentBranch") != null)
				valueObjectIn.put("isAgentBranch", request.getParameter("isAgentBranch"));

			valueObjectIn.put("branchCode", JSPUtility.GetString(request, "branchCode", null));
			valueObjectIn.put("serviceTaxCode", JSPUtility.GetString(request, "serviceTaxCode", null));

			if(request.getParameter("isCrossingHub") != null)
				valueObjectIn.put("isCrossingHub", request.getParameter("isCrossingHub"));

			valueObjectIn.put("displayName", JSPUtility.GetString(request, "displayName", null));
			valueObjectIn.put("abbrvtnCode", StringUtils.upperCase(JSPUtility.GetString(request, "abbrvtnCode", "")));
			valueObjectIn.put("panNo", StringUtils.upperCase(JSPUtility.GetString(request, "panNo", "")));
			valueObjectIn.put("gstn", StringUtils.upperCase(JSPUtility.GetString(request, "gstn", "")));
			valueObjectIn.put("tdsAmount", JSPUtility.GetDouble(request, "tdsAmount", 0.00) );

			if(request.getParameter("isTDSApplicable") != null)
				valueObjectIn.put("isTDSApplicable", request.getParameter("isTDSApplicable"));

			if(request.getParameter("isAllowInMobApp") != null)
				valueObjectIn.put("isAllowInMobApp", request.getParameter("isAllowInMobApp"));

			valueObjectIn.put("remark", JSPUtility.GetString(request, "remark", null));
			valueObjectIn.put("isParentBranch", JSPUtility.GetChecked(request, "isParentBranch"));
			valueObjectIn.put("branchLimit", JSPUtility.GetString(request, "branchLimit", null));
			valueObjectIn.put("thresholdLimit", JSPUtility.GetString(request, "thresholdLimit", null));
			valueObjectIn.put("latitude", JSPUtility.GetString(request, "latitude", null));
			valueObjectIn.put("longitude", JSPUtility.GetString(request, "longitude", null));
			valueObjectIn.put("vehicleServiceType", JSPUtility.GetShort(request,"vehicleServiceType",(short) 0 ));
			valueObjectIn.put("contactPersonNo", JSPUtility.GetString(request,"contactPersonNo",null));
			valueObjectIn.put("salesManagerName", JSPUtility.GetString(request,"salesManagerName",null));
			valueObjectIn.put("salesManagerNumber", JSPUtility.GetString(request,"salesManagerNo",null));
			valueObjectIn.put("salesManagerEmail", JSPUtility.GetString(request,"salesEmailAddress",null));
			valueObjectIn.put("branchServiceType", JSPUtility.GetShort(request,"branchServiceType",(short) 0 ));

		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}
	}

	private String insertBranch(final HttpServletRequest request, final Executive exec, final JSONObject jsonObjectIn, final JSONObject jsonObjectOut, final Map<Object, Object> configuration) throws Exception {
		var				newBranchId				= 0L;
		String			strResponse				= null;
		var 			regionId				= 0L;
		var 			subRegionId				= 0L;

		try {
			final var	cache						= new CacheManip(request);
			var			valueObjectIn				= new ValueObject();
			final var	branchBll					= new BranchBll();
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(exec, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);
			final var	noOfDays    				= cache.getConfigValue(request, exec.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			var	handlingBranchId		= JSPUtility.GetLong(request, "handlingBranchId",0);
			var	locationBranchId		= JSPUtility.GetLong(request, "locationBranchId",0);
			final var	isFtlBooking	= jsonObjectOut.optBoolean("isFtlBooking", false);

			if(isFtlBooking) {
				valueObjectIn = JsonUtility.convertJsontoValueObject(jsonObjectIn);
				valueObjectIn.put("branchType", Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH);
				handlingBranchId	= valueObjectIn.getLong("handlingBranchId", 0);
			} else
				setBranch(request, valueObjectIn);

			if(handlingBranchId > 0)
				locationBranchId	= handlingBranchId;

			valueObjectIn.put("locationBranchId", locationBranchId);
			valueObjectIn.put(Executive.EXECUTIVE, exec);
			valueObjectIn.put("noOfDays", noOfDays);
			valueObjectIn.put(BranchMasterConfigurationConstant.BRANCH_MASTER_CONFIGURATION, configuration);
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);
			valueObjectIn.put(SearchConfigPropertiesConstant.SEARCH_CONFIGURATION, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SEARCH_CONFIGURATION));
			valueObjectIn.put(SyncWithNexusPropertiesConstant.SYNC_WITH_NEXUS, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS));
			valueObjectIn.put(SyncWithIVFleetPropertiesConstant.SYNC_WITH_IVFLEET, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET));
			valueObjectIn.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));

			if(((boolean) configuration.getOrDefault(BranchMasterConfigurationConstant.CREATE_OPERATIONAL_BRANCH_WITH_LIMITED_FIELDS, false) || isFtlBooking) && handlingBranchId > 0) {
				final var	handingBranch	= cache.getBranchById(request, exec.getAccountGroupId(), handlingBranchId);

				if(handingBranch != null) {
					regionId	= handingBranch.getRegionId();
					subRegionId	= handingBranch.getSubRegionId();
				}

				if(!isFtlBooking) {
					valueObjectIn.put("state", JSPUtility.GetLong(request, "stateId",0));
					valueObjectIn.put("city", JSPUtility.GetLong(request, "cityId",0));
					valueObjectIn.put("name", StringUtils.upperCase(JSPUtility.GetString(request, "branchName", "")));
					valueObjectIn.put("displayName", StringUtils.upperCase(JSPUtility.GetString(request, "branchDisplayName", "")));
				}

				valueObjectIn.put("region", regionId);
				valueObjectIn.put("subRegion", subRegionId);
				valueObjectIn.put("isDeliveryPlace", Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE);
			}

			if(BranchDao.getInstance().isBranchNameExistsForCity(valueObjectIn.getString("name"), valueObjectIn.getLong("city", 0), exec.getAccountGroupId())) {
				strResponse = "Branch Already Exist";
				jsonObjectOut.put("strResponse", strResponse);
			} else {
				newBranchId = branchBll.insert(valueObjectIn);

				if(newBranchId == 300)//error code
					return "You Cannot make More than one Parent Branch";

				if(newBranchId > 0) {
					jsonObjectOut.put("newBranchId", newBranchId);
					// add new Branch to cache
					//cache.refreshCacheForBranch(request, newBranchId);
					cache.refreshGenericBranchDetailCache(request);
					cache.refreshCacheForLocationMapping(request, exec.getAccountGroupId());
					cache.refreshAllAccountGroupNetworkConfig(request);
					cache.refreshBranchNetworkConfiguration(request, exec.getAccountGroupId());

					strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
				} else
					strResponse = "Branch Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String updateBranch(final HttpServletRequest request, final Executive exec, final Map<Object, Object> configuration) throws Exception {
		var						branchId					= 0L;

		try {
			final var	branchBll			= new BranchBll();
			final var	cache				= new CacheManip(request);
			final var	valueObjectIn		= new ValueObject();
			final var	isGeoLocation		= JSPUtility.GetBoolean(request, "isGeoLocation", false);

			if(isGeoLocation) {
				valueObjectIn.put("latitude", JSPUtility.GetString(request, "latitude", null));
				valueObjectIn.put("longitude", JSPUtility.GetString(request, "longitude", null));
				branchId	= exec.getBranchId();
				valueObjectIn.put("locationBranchId", branchId);
			} else {
				branchId	= JSPUtility.GetLong(request, "selectedBranchId", 0);
				valueObjectIn.put("locationBranchId", JSPUtility.GetLong(request, "locationBranchId", 0));
			}

			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(exec, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);
			final var	branchModel					= cache.getGenericBranchDetailCache(request, branchId);

			valueObjectIn.put("locationBranchId", JSPUtility.GetLong(request, "locationBranchId", 0));
			valueObjectIn.put("executive", exec);
			valueObjectIn.put("prevLocation", cache.getLocationMappingDetailsByAssignedLocationId(request, exec.getAccountGroupId(), branchId));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);
			valueObjectIn.put(SearchConfigPropertiesConstant.SEARCH_CONFIGURATION, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SEARCH_CONFIGURATION));
			valueObjectIn.put("branch", branchModel);
			valueObjectIn.put(BranchMasterConfigurationConstant.BRANCH_MASTER_CONFIGURATION, configuration);
			valueObjectIn.put("isExistingParentBranch", branchModel.isParentBranch());
			valueObjectIn.put(SyncWithNexusPropertiesConstant.SYNC_WITH_NEXUS, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS));
			valueObjectIn.put(SyncWithIVFleetPropertiesConstant.SYNC_WITH_IVFLEET, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET));
			valueObjectIn.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));

			if(isGeoLocation)
				setBranchModelFromGeoLocation(request, valueObjectIn, branchModel);
			else
				setBranch(request, valueObjectIn);

			final var	strResponse = branchBll.update(valueObjectIn);

			if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)) {
				// add new Branch to cache
				cache.refreshCacheForBranch(request, branchId);
				cache.refreshGenericBranchDetailCache(request);
				cache.refreshCacheForLocationMapping(request, exec.getAccountGroupId());
				cache.refreshCacheForCrossingAgentBookingSourceMap(request, exec.getAccountGroupId());
				cache.refreshAllAccountGroupNetworkConfig(request);
				cache.refreshBranchNetworkConfiguration(request, exec.getAccountGroupId());
			}

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String updateStatus(final HttpServletRequest request, final Executive exec, final short status, final Map<Object, Object> configuration) throws Exception {
		String				strResponse					= null;

		try {
			final var	cache						= new CacheManip(request);
			final var	branchBll					= new BranchBll();
			final var	valueObjectIn				= new ValueObject();
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(exec, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			final var	branchId	= JSPUtility.GetLong(request, "selectedBranchId", 0);
			final var	branchModel = cache.getGenericBranchDetailCache(request, branchId);
			final var prevLocation	= cache.getLocationMappingDetailsByAssignedLocationId(request, exec.getAccountGroupId(), branchId);

			valueObjectIn.put("selectedBranchId", JSPUtility.GetLong(request, "selectedBranchId", 0));
			valueObjectIn.put("locationBranchId", JSPUtility.GetLong(request, "locationBranchId", 0));
			valueObjectIn.put("executive", exec);
			valueObjectIn.put("branch", branchModel);
			valueObjectIn.put("branchId", branchId);
			valueObjectIn.put("status", status);
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);
			valueObjectIn.put("prevLocation", prevLocation);
			valueObjectIn.put(BranchMasterConfigurationConstant.BRANCH_MASTER_CONFIGURATION, configuration);
			valueObjectIn.put(SyncWithNexusPropertiesConstant.SYNC_WITH_NEXUS, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS));
			valueObjectIn.put(SyncWithIVFleetPropertiesConstant.SYNC_WITH_IVFLEET, cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET));

			strResponse	= branchBll.updateBranchStatus(valueObjectIn);

			if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)) {
				// update cache
				cache.refreshCacheForBranch(request, branchId);
				cache.refreshGenericBranchDetailCache(request);
				cache.refreshCacheForLocationMapping(request, exec.getAccountGroupId());
				cache.refreshCacheForCrossingAgentBookingSourceMap(request, exec.getAccountGroupId());
				cache.refreshAllAccountGroupNetworkConfig(request);
				cache.refreshBranchNetworkConfiguration(request, exec.getAccountGroupId());
			}

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setBranchModelFromGeoLocation(final HttpServletRequest request, final ValueObject valueObjectIn, final Branch branch) throws Exception {
		try {
			valueObjectIn.put("selectedBranchId", branch.getBranchId());
			valueObjectIn.put("agency", branch.getAgencyId());
			valueObjectIn.put("name", branch.getName());
			valueObjectIn.put("address", branch.getAddress());
			valueObjectIn.put("city", branch.getCityId());
			valueObjectIn.put("state", branch.getStateId());
			valueObjectIn.put("pinCode", branch.getPincode());
			valueObjectIn.put("contactPerson", branch.getContactPersonName());
			valueObjectIn.put("phoneNumber1", branch.getPhoneNumber());
			valueObjectIn.put("mobileNumber1", branch.getMobileNumber());
			valueObjectIn.put("phoneNumber2", branch.getPhoneNumber2());
			valueObjectIn.put("mobileNumber2", branch.getMobileNumber2());
			valueObjectIn.put("faxNumber", branch.getFaxNumber());
			valueObjectIn.put("emailAddress", branch.getEmailAddress());
			valueObjectIn.put("branchType", branch.getBranchType());
			valueObjectIn.put("region", branch.getRegionId());
			valueObjectIn.put("subRegion", branch.getSubRegionId());

			if(request.getParameter("isDeliveryPlace") != null)
				valueObjectIn.put("isDeliveryPlace", request.getParameter("isDeliveryPlace"));

			valueObjectIn.put("isAgentBranch", branch.isAgentBranch() ? "Yes" : "No");
			valueObjectIn.put("branchCode", branch.getBranchCode());
			valueObjectIn.put("serviceTaxCode", branch.getServiceTaxCode());
			valueObjectIn.put("isCrossingHub", branch.isCrossingHub() ? 1 : 0);
			valueObjectIn.put("displayName", branch.getDisplayName());
			valueObjectIn.put("abbrvtnCode", branch.getAbbrevationName());
			valueObjectIn.put("panNo", branch.getPanNumber());
			valueObjectIn.put("gstn", branch.getGstn());
			valueObjectIn.put("tdsAmount", branch.getTdsAmount());
			valueObjectIn.put("isTDSApplicable", branch.isTDSApplicable() ? "Yes" : "No");
			valueObjectIn.put("isAllowInMobApp", branch.isVisibleOnMobApp() ? 1 : 0);
			valueObjectIn.put("remark", branch.getRemark());
			valueObjectIn.put("isParentBranch", branch.isParentBranch());
			valueObjectIn.put("branchLimit",branch.getBranchLimit());
			valueObjectIn.put("thresholdLimit", branch.getThresholdLimit());
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
