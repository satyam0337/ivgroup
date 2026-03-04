package com.ivcargo.actionUtility;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dao.impl.AccountGroupPermissionsDaoImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.MenuGroupConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.BusinessFunctions;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LocationsMapping;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ActionStaticUtil {

	private static final String TRACE_ID 					= "ActionStaticUtil";

	public	static final String NEXTPAGETOKEN				= "nextPageToken";
	public	static final String SUCCESS						= "success";
	public	static final String FAILURE						= "failure";
	public	static final String NEEDLOGIN					= "needlogin";

	public	static final String FROMDATE					= "fromDate";
	public	static final String TODATE						= "toDate";
	public	static final String FROMTIME					= " 00:00:00";
	public	static final String TOTIME						= " 23:59:59";
	public	static final String NOFROMDATE					= "noFromDate";
	public	static final String NOTODATE					= "noToDate";

	public	static final short PRESELECTED_REGION			= 1;
	public	static final short PRESELECTED_SUBREGION		= 2;
	public	static final short PRESELECTED_BRANCH			= 3;
	public	static final short PRESELECTED_CITY				= 4;

	public	static final String PRESELECTED_REGION_NAME		= "selectedRegion";
	public	static final String PRESELECTED_SUBREGION_NAME	= "selectedSubRegion";
	public	static final String PRESELECTED_BRANCH_NAME		= "selectedBranch";
	public	static final String PRESELECTED_CITY_NAME		= "selectedCity";
	public	static final String PRESELECTED_EXECUTIVE_NAME	= "selectedExecutive";
	public	static final String PRESELECTED_GODOWN_NAME		= "selectedGodown";
	public	static final String NO_RECORDS_FOUND			= "No Records Found";
	public	static final String IS_BOTH_TYPE_BRANCHES_NEEDED= "isBothTypeBranchesNeeded";
	public	static final String IS_ALL_BRANCHES_NEED_TO_SHOW= "isAllBranchesNeedToShow";
	public	static final String IS_ALL_TO_BRANCHES_NEED_TO_SHOW = "isAllBranchesNeedToShow";
	public	static final String IS_ALL_AREA_NEED_TO_SHOW 	= "isAllAreaNeedToShow";
	public	static final String IS_ALL_EXECUTIVE_NEED_TO_SHOW 	= "isAllExecutiveNeedToShow";
	public	static final String IS_ALL_TO_AREA_NEED_TO_SHOW = "isAllToAreaNeedToShow";
	public	static final String IS_ALL_REGION_NEED_TO_SHOW 	= "isAllRegionNeedToShow";
	public	static final String IS_ALL_CITY_NEED_TO_SHOW 	= "isAllCityNeedToShow";
	public	static final String IS_ALL_ENDCITY_NEED_TO_SHOW = "isAllEndCityNeedToShow";
	public	static final String IS_ALL_ENDBRANCH_NEED_TO_SHOW = "isAllEndBranchNeedToShow";
	public	static final String IS_EXECUTIVE_NEED_TO_SHOW = "isExecutiveNeedToShow";
	public	static final String IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW = "isAssignedLocationsNeedToShow";
	public	static final String IS_ALL_PAYMENT_TYPE_OPTION_TO_SHOW = "isAllPaymentTypeNeedToShow";
	public	static final String IS_ALL_WAYBILL_STATUS_OPTION_NEED_TO_SHOW = "isAllWayBillStatusOptionNeedToShow";
	public	static final String SHOW_REGION_SELECTION_FOR_REGION_ADMIN = "showRegionSelectionForRegionAdmin";


	private static boolean EXECUTIVE_TYPE_GROUPADMIN		= false;
	private static boolean EXECUTIVE_TYPE_REGIONADMIN		= false;
	private static boolean EXECUTIVE_TYPE_SUBREGIONADMIN	= false;

	/**********************	Do Not Make Any Method Static *****************************/

	//Method that set all Executive type boolans to false
	public static void setDefaultValuesInAllBoolean() {
		EXECUTIVE_TYPE_GROUPADMIN		= false;
		EXECUTIVE_TYPE_REGIONADMIN		= false;
		EXECUTIVE_TYPE_SUBREGIONADMIN	= false;
	}

	//Method that return logged in executive DTO from session
	public static Executive getExecutive(final HttpServletRequest request) throws Exception {
		try {
			return (Executive) request.getSession().getAttribute("executive");
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return array of Region DTO by account group id from cache
	public static Region[] getRegionsByGroupId(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);
			return cache.getRegionsByGroupId(request, executive.getAccountGroupId());
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return array of Region DTO by account group id from cache & set it into request attribute
	public static void getRegionsByGroupId(final HttpServletRequest request,final Executive executive,final boolean isSetInRequest) throws Exception {
		try {
			final var	regionArrForGroup 	= getRegionsByGroupId(request, executive);

			if(isSetInRequest)
				setRequestAttribute(request, "regionForGroup", regionArrForGroup);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return array of Sub Region DTO by account group id & region id from cache
	public static SubRegion[] getSubRegionsByRegionId(final HttpServletRequest request, final long regionId, final long accountGroupId) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);
			return cache.getSubRegionsByRegionId(request, regionId, accountGroupId);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return array of Sub Region DTO by account group id and region id from cache & set it into request attribute
	public static void getSubRegionsByRegionId(final HttpServletRequest request, final long regionId, final long accountGroupId,final boolean isSetInRequest) throws Exception {
		try {
			final var	subRegionForGroup 	= getSubRegionsByRegionId(request, regionId, accountGroupId);

			if(isSetInRequest)
				setRequestAttribute(request, "subRegionForGroup", subRegionForGroup);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return Branch DTO by account group id & branch id from cache
	public static Branch getGenericBranchDetailCache(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	cache 	= new CacheManip(request);
			return cache.getGenericBranchDetailCache(request,branchId);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return hashmap of Physical Branches by account group id and sub region id from cache
	public static HashMap<Long, Branch> getPhysicalBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);
			return cache.getPhysicalBranchesBySubRegionId(request,accountGroupId, subRegionId);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return hashmap of Physical Branches by account group id and sub region id from cache & set it into request attribute
	public static void getPhysicalBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId, final boolean isSetInRequest) throws Exception {
		try {
			final var	subRegionBranches 	= getPhysicalBranchesBySubRegionId(request,accountGroupId, subRegionId);

			if(isSetInRequest)
				setRequestAttribute(request, "subRegionBranches", subRegionBranches);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return hashmap of Both Type Branches by account group id and sub region id from cache & set it into request attribute
	public static void getBothTypeBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId, final boolean isSetInRequest) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);
			final var	subRegionBranches 	= cache.getBranchesBySubRegionId(request,accountGroupId, subRegionId);

			if(isSetInRequest)
				setRequestAttribute(request, "subRegionBranches", subRegionBranches);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void getAssignedLocationsByLocationId(final HttpServletRequest request, final long accountGroupId, final long branchId, final boolean isSetInRequest) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);

			final var	locationMappingList = cache.getAssignedLocationsByLocationIdId(request, branchId, accountGroupId);

			if(isSetInRequest)
				setRequestAttribute(request, "locationMappingList", locationMappingList);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static SubRegion[] getSubRegionsByGroupId(final HttpServletRequest request, final long accountGroupId, final boolean isSetInRequest,final CacheManip cache) throws Exception {
		try {
			final var	grupSubRegionArr = cache.getSubRegionsByGroupId(request, accountGroupId);

			if(isSetInRequest)
				request.setAttribute("grupSubRegionArr", grupSubRegionArr);

			return grupSubRegionArr;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static ArrayList<Long> getAssignedLocationsIdListByLocationIdId(final HttpServletRequest request, final Executive executive, final boolean isSetInRequest,final CacheManip cache) throws Exception {
		try {
			final var	locationList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(isSetInRequest)
				setRequestAttribute(request, "locationList", locationList);

			return locationList;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static HashMap<Long, Branch> getBranchesByRegionId(final HttpServletRequest request, final Executive executive, final boolean isSetInRequest,final CacheManip cache) throws Exception {
		try {
			final var	regionAllBranches = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());

			if(isSetInRequest)
				request.setAttribute("RegionAllBranches", regionAllBranches);

			return regionAllBranches;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static ArrayList<Long> getAssignedLocationsIdListByLocationIdId(final HttpServletRequest request, final Executive executive, final boolean isSetInRequest) throws Exception {
		try {
			final var	cache 		= new CacheManip(request);
			final var	locationList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(isSetInRequest)
				setRequestAttribute(request, "locationList", locationList);

			return locationList;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return array of Region DTO by account group id from cache & set it into request attribute
	public static void getToRegionsByGroupId(final HttpServletRequest request,final Executive executive,final boolean isSetInRequest) throws Exception {
		try {
			final var	regionArrForGroup 	= getRegionsByGroupId(request,executive);

			if(isSetInRequest)
				setRequestAttribute(request, "toRegionForGroup", regionArrForGroup);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set attribute in request
	public static void setRequestAttribute(final HttpServletRequest request,final String name,final Object obj) throws Exception {
		try {
			request.setAttribute(name, obj);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set next page token in request attribute
	public static void setNextPageToken(final HttpServletRequest request,final String token) throws Exception {
		try {
			setRequestAttribute(request,NEXTPAGETOKEN,token);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return boolean which specify permission(you passed in parameter) is allowed to executive or not
	public static boolean isPermissionAllowed(final HttpServletRequest request,final HashMap<Long,ExecutiveFeildPermissionDTO> execFldPermissions,final long permissionConstant) throws Exception {
		try {
			if(execFldPermissions == null)
				return false;

			final var	execFeildPermission = execFldPermissions.get(permissionConstant);

			return execFeildPermission != null;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that process bunch of permission(you passed in parameter) and check which permission is allowed to logged in executive & return hashmap that contains flags
	public static HashMap<Long,Boolean> isPermissionsAllowed(final HttpServletRequest request,final HashMap<Long,ExecutiveFeildPermissionDTO> execFldPermissions,final ArrayList<Long> permissionConstants) throws Exception {
		try {
			if(permissionConstants == null || permissionConstants.isEmpty())
				return null;

			final var	permissionWiseFlag = new HashMap<Long,Boolean>();

			for (final Long permissionConstant : permissionConstants)
				permissionWiseFlag.put(permissionConstant, isPermissionAllowed(request,execFldPermissions,permissionConstant));

			return permissionWiseFlag;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set logged in executive's permissions in request attribute
	public static void setExecutiveAllowedPermissions(final HttpServletRequest request,final HashMap<Long,Boolean> isPermissionsAllowedHM) throws Exception {
		try {
			if(isPermissionsAllowedHM == null || isPermissionsAllowedHM.size() <= 0)
				return;

			for(final Long key : isPermissionsAllowedHM.keySet())
				setRequestAttribute(request, Long.toString(key), isPermissionsAllowedHM.get(key));
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that convert given date & time to timestamp
	public static Timestamp getFromToDate(final HttpServletRequest request,final String date,final String time) throws Exception {
		try {
			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			return new Timestamp(sdf.parse(JSPUtility.GetString(request, date) + time).getTime());
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static Timestamp getFromToDatetFromString(final String date,final String time) throws Exception {
		try {
			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			return new Timestamp(sdf.parse(date + time).getTime());
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return boolean by comparing executive type
	public static boolean isExecutiveType(final short exeType,final short compareWithType) throws Exception {
		try {
			return exeType == compareWithType ;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return ArrayList<Long> which contains branch ids with no duplicate of branch id passed in parameter
	public static ArrayList<Long> addAssignedLocationIds(final ArrayList<Long> assignedLocationIdList, final long branchId) throws Exception {
		try {
			if(!assignedLocationIdList.contains(branchId))
				assignedLocationIdList.add(branchId);

			return assignedLocationIdList;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method For set core information in request attribute for laser print & plain print
	public static void setReportViewModel(final HttpServletRequest request) throws Exception {

		try {
			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			request.setAttribute("reportViewModel", reportViewModel);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that check the system got some error or not before staring execution of Action class & return booelan
	public static boolean isSystemError(final HttpServletRequest request,final HashMap<String,Object> error) throws Exception {
		var		isSystemGotError	= false;

		try {
			if (error != null && error.size() > 0 && error.containsKey(CargoErrorList.ERROR_CODE)) {
				setRequestAttribute(request, "cargoError", error);

				final var	errorCode = (Integer) error.get(CargoErrorList.ERROR_CODE);

				if(errorCode == CargoErrorList.SESSION_INVALID)
					setNextPageToken(request, NEEDLOGIN);
				else
					setNextPageToken(request, FAILURE);

				isSystemGotError	= true;
			}

			return isSystemGotError;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return hashtable(collection of errors) from request
	@SuppressWarnings("unchecked")
	public static HashMap<String, Object> getSystemErrorColl(final HttpServletRequest request) throws Exception {
		try { // can use directly but its make centralize for attribute name error
			var	error	= (HashMap<String, Object>) request.getAttribute("error");

			if(error == null)
				error	= new HashMap<>();

			return error;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return handling branch id of given branch id
	public static long getHandlingBranchIdByBranchId(final HttpServletRequest request, final Branch srcBranch, final long accGrpId) throws Exception{
		LocationsMapping	locationsMapping	= null;
		var 				handlingBranchId	= 0L;

		try {
			final var	cache = new CacheManip(request);

			if(srcBranch == null)
				return 0;

			if(srcBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL)
				handlingBranchId =  srcBranch.getBranchId();
			else if(srcBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_NON_OPERATIONAL_PLACE)
				handlingBranchId =  0;
			else{
				locationsMapping = cache.getActiveLocationMapping(request, accGrpId, srcBranch.getBranchId()); // do not use account group id from branch dto bcoz branch is from group merging also

				if(locationsMapping != null)
					handlingBranchId =  locationsMapping.getLocationId();
				else
					handlingBranchId =  srcBranch.getBranchId();
			}

			return handlingBranchId;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// Method gives time taken by the report
	public static void getReportElapsedTime(final String traceId ,final Executive executive,final long startTime)throws Exception{
		try {
			final var	dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+TRACE_ID+" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static String getBranchesStringByExecutiveType(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	cache 		= new CacheManip(request);

			return switch (executive.getExecutiveType()) {
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> cache.getSelfBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> cache.getSelfBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, executive.getRegionId());
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> cache.getSelfBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, executive.getSubRegionId());
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN -> Long.toString(executive.getBranchId());
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE -> Long.toString(executive.getBranchId());
			default -> Long.toString(executive.getBranchId());
			};
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// Set Boolean for branch selection as per executive type in request
	public static void setBranchSelectionBooleans(final HttpServletRequest request,final Executive executive) throws Exception {
		var		isRegionToShow		= false;
		var		isSubRegionToShow	= false;
		var		isBranchToShow		= false;
		var		isDestinationToShow	= false;

		try {
			isDestinationToShow = switch (executive.getExecutiveType()) {
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> {
				isRegionToShow		= true;
				isSubRegionToShow	= true;
				isBranchToShow		= true;
				yield true;
			}
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> {
				isSubRegionToShow	= true;
				isBranchToShow		= true;
				yield true;
			}
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> {
				isBranchToShow		= true;
				yield true;
			}
			default -> true;
			};

			request.setAttribute(AliasNameConstants.IS_REGION_TO_SHOW, isRegionToShow);
			request.setAttribute(AliasNameConstants.IS_SUBREGION_TO_SHOW, isSubRegionToShow);
			request.setAttribute(AliasNameConstants.IS_BRANCH_TO_SHOW, isBranchToShow);
			request.setAttribute(AliasNameConstants.IS_DESTINATION_TO_SHOW, isDestinationToShow);

		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void executiveTypeWiseSelection(final HttpServletRequest request, final CacheManip cache, final Executive loggedInExec) {
		try {
			if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("groupRegions", cache.getRegionsByGroupId(request, loggedInExec.getAccountGroupId()));
			else if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("subRegionForRegion", cache.getActiveSubRegionsByRegionId(request, loggedInExec.getRegionId(), loggedInExec.getAccountGroupId()));
			else if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				request.setAttribute("branchArr", cache.getBranchesArrayBySubRegionId(request, loggedInExec.getAccountGroupId(), loggedInExec.getSubRegionId()));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void executiveTypeWiseSelection1(final HttpServletRequest request, final CacheManip cache, final Executive executive) {
		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
				request.setAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, true);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
				request.setAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, true);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				final var execBranch = cache.getGenericBranchDetailCache(request, executive.getBranchId());
				request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId()));
				request.setAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, true);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void executiveTypeWiseSelection2(final HttpServletRequest request, final CacheManip cache, final Executive loggedInExec) {
		try {
			if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("groupRegions", cache.getRegionsByGroupId(request, loggedInExec.getAccountGroupId()));
			else if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("subRegionForRegion", cache.getActiveSubRegionsByRegionId(request, loggedInExec.getRegionId(), loggedInExec.getAccountGroupId()));
			else if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				final var	branchList = cache.getActiveBranchesBySubRegionId(request, loggedInExec.getAccountGroupId(),loggedInExec.getSubRegionId());

				final var	branchArr = new Branch[branchList.size()];
				branchList.toArray(branchArr);
				request.setAttribute("branchArr", branchArr);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void executiveTypeWiseSelection3(final HttpServletRequest request, final CacheManip cache, final Executive executive) {
		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				final var execBranch 	= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
				request.setAttribute("subRegionBranches", cache.getBranchesBySubRegionId(request,execBranch.getAccountGroupId(), execBranch.getSubRegionId()));
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void executiveTypeWiseBranches(final HttpServletRequest request, final CacheManip cache, final Executive executive) {
		var			regionIdForSrc		= 0L;
		var			subRegionIdForSrc	= 0L;
		var			isListAll			= true;

		try {
			if(request.getAttribute("isListAll") != null)
				isListAll	= Boolean.TRUE.equals(request.getAttribute("isListAll"));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionIdForSrc 		= JSPUtility.GetLong(request, "region", 0);
				subRegionIdForSrc 	= JSPUtility.GetLong(request, "subRegion", 0);

				// Get Combo values to restore
				if(isListAll)
					request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionIdForSrc, executive.getAccountGroupId()));
				else
					request.setAttribute("subRegionForGroup", cache.getActiveSubRegionsByRegionId(request, regionIdForSrc, executive.getAccountGroupId()));

				request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionIdForSrc));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				subRegionIdForSrc 	= JSPUtility.GetLong(request, "subRegion", 0);
				// Get Combo values to restore

				if(isListAll)
					request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
				else
					request.setAttribute("subRegionForGroup", cache.getActiveSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));

				request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionIdForSrc));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				subRegionIdForSrc 	= executive.getSubRegionId();
				// Get Combo values to restore
				request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionIdForSrc));
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static String getPhysicalBranchIds(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String		branchesIds		= null;
		var 		srcBranchId 	= 0L;
		var 		subRegionId 	= 0L;
		var 		regionId	 	= 0L;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(subRegionId > 0 && srcBranchId > 0)
				branchesIds = Long.toString(srcBranchId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static String getBranchIds(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String		branchesIds		= null;
		var 		srcBranchId 	= 0L;
		var 		subRegionId 	= 0L;
		var 		regionId	 	= 0L;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(subRegionId > 0 && srcBranchId > 0)
				branchesIds = Long.toString(srcBranchId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static String getPhysicalBranchIds1(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String		branchesIds		= null;
		var 		srcBranchId 	= 0L;
		var 		subRegionId 	= 0L;
		var 		regionId	 	= 0L;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(regionId == 0 && subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
			else if(regionId > 0 && subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(regionId > 0 && subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(regionId > 0 && subRegionId > 0 && srcBranchId > 0)
				branchesIds = Long.toString(srcBranchId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static String getBranchIds1(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String		branchesIds		= null;
		var 		srcBranchId 	= 0L;
		var 		subRegionId 	= 0L;
		var 		regionId	 	= 0L;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(regionId == 0 && subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
			else if(regionId > 0 && subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(regionId > 0 && subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(regionId > 0 && subRegionId > 0 && srcBranchId > 0)
				branchesIds = Long.toString(srcBranchId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static String getBranchIdsWithAssignedLocation(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String			branchesIds		= null;
		var 			srcBranchId 	= 0L;
		var 			subRegionId 	= 0L;
		var 			regionId	 	= 0L;
		var			locationId				= 0L;
		ArrayList<Long>	assignedLocationIdList	= null;

		try {
			locationId	= JSPUtility.GetLong(request, "locationId" ,0);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(regionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getSelfBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else if(subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(subRegionId > 0 && srcBranchId > 0 && locationId > 0)
				branchesIds = Long.toString(locationId);
			else if(subRegionId > 0 && srcBranchId > 0) {
				assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, srcBranchId, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(srcBranchId))
					assignedLocationIdList.add(srcBranchId);

				branchesIds = Utility.GetLongArrayListToString(assignedLocationIdList);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static String getBranchIdsWithAssignedLocation1(final HttpServletRequest request, final CacheManip cManip, final Executive executive) {
		String			branchesIds		= null;
		var 			srcBranchId 	= 0L;
		var 			subRegionId 	= 0L;
		var 			regionId	 	= 0L;
		ArrayList<Long>	assignedLocationIdList	= null;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(regionId == 0 && subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
			else if(subRegionId == 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			else if(subRegionId > 0 && srcBranchId == 0)
				branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(subRegionId > 0 && srcBranchId > 0) {
				assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, srcBranchId, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(srcBranchId))
					assignedLocationIdList.add(srcBranchId);

				branchesIds = Utility.GetLongArrayListToString(assignedLocationIdList);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchesIds;
	}

	public static void executiveTypeWiseActiveBranches(final HttpServletRequest request, final CacheManip cache, final Executive executive) {
		HashMap<Long, Branch> 			branch  						= null;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branch = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getAccountGroupId());
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				branch = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getRegionId());
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branch = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getSubRegionId());
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE)
				branch = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getBranchId());

			request.setAttribute("allGroupBranches", branch);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void throwInvalidSessionError(final HttpServletRequest request, HashMap<String, Object> error) {
		if(error == null)
			error	= new HashMap<>();

		error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SESSION_INVALID);
		error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SESSION_INVALID_DESCRIPTION);
		request.setAttribute("error", error);
	}

	public static boolean isAllowToAccessOperation(final HashMap<String, Object> error, final CacheManip cache, final HttpServletRequest request, final String uniqueKey, final short filter) throws Exception {
		final var 	executive								= cache.getExecutive(request);

		if(executive == null) return false;

		final var	generalConfiguration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
		final var	restrictAccessToReportsCopyingURL		= (boolean) generalConfiguration.getOrDefault(GeneralConfigurationPropertiesConstant.RESTRICT_ACCESS_TO_REPORTS_COPYING_URL, false);

		if(!restrictAccessToReportsCopyingURL) return true;

		final var	execFunctions 			= cache.getExecFunctions(request);

		if(execFunctions == null) return false;

		final var 	businessMap			= cache.getBusinessFunctions(request);

		if(filter == BusinessFunctionConstants.PERMISSION_TYPE_REPORT && !execFunctions.containsKey(BusinessFunctionConstants.REPORT) && !execFunctions.containsKey(BusinessFunctionConstants.NEWREPORT)) {
			getErrorMessageForPermission(error, businessMap, request, BusinessFunctionConstants.REPORT, executive);
			return false;
		}

		if (execFunctions.containsKey(uniqueKey))
			return true;

		getErrorMessageForPermission(error, businessMap, request, uniqueKey, executive);

		return false;
	}

	public static boolean isAllowToAccessOperation(final HashMap<String, Object> error, final CacheManip cache, final HttpServletRequest request, final String uniqueKey) throws Exception {
		return isAllowToAccessOperation(error, cache, request, uniqueKey, BusinessFunctionConstants.PERMISSION_TYPE_MODULE);
	}

	public static void getErrorMessageForPermission(HashMap<String, Object> error, final Map<String, BusinessFunctions> businessMap, final HttpServletRequest request, final String uniqueKey, final Executive executive) throws Exception {
		final var	businessFunctions	= businessMap.get(uniqueKey);

		if(error == null)
			error	= new HashMap<>();

		error.put(CargoErrorList.ERROR_CODE, CargoErrorList.FEILD_PERMISSIONS_NOT_FOUND);

		if(businessFunctions == null)
			error.put(CargoErrorList.ERROR_DESCRIPTION, "Wrong permission.");
		else {
			final var	accGroupPermission = AccountGroupPermissionsDaoImpl.getInstance().getGroupLevelBusinessFunctions(executive.getAccountGroupId(), businessFunctions.getBusinessFunctionId());
			var		menuGroupId	= 0L;
			String 	displayName = null;

			if(accGroupPermission != null) {
				menuGroupId	= accGroupPermission.getMenuGroupId();
				displayName	= accGroupPermission.getDisplayName();
			} else {
				menuGroupId	= businessFunctions.getMenuGroupId();
				displayName	= businessFunctions.getDisplayName();
			}

			error.put(CargoErrorList.ERROR_DESCRIPTION, "You do not have permission to access " + displayName + ".");
			request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, !MenuGroupConstant.isReport(menuGroupId));
		}

		request.setAttribute("cargoError", error);
		request.setAttribute("error", error);
		request.setAttribute("nextPageToken", "failure");
	}

	//Method that Process the steps to catch exception for action class
	public static void catchActionException(final HttpServletRequest request, final Exception exception, HashMap<String, Object> error) {
		try {
			ExceptionProcess.execute(exception, TRACE_ID);

			if(error == null)
				error	= new HashMap<>();

			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);

			setRequestAttribute(request, "cargoError", error);
			setNextPageToken(request, FAILURE);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void setExecutiveTypeBooleanInRequest(final HttpServletRequest request, final Executive executive, final boolean isUserPreSelectionNeeded) throws Exception {
		try {
			switch (executive.getExecutiveType()) {
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> setGroupAdminBooleanInRequest(request, executive);
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> {
				setRegionAdminBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded)
					setRequestAttribute(request, PRESELECTED_REGION_NAME, executive.getRegionName());
			}
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> {
				setSubRegionAdminBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded) {
					setRequestAttribute(request, PRESELECTED_REGION_NAME, executive.getRegionName());
					setRequestAttribute(request, PRESELECTED_SUBREGION_NAME, executive.getSubRegionName());
				}
			}
			case ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN, ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE -> {
				setExecutiveBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded) {
					setRequestAttribute(request, PRESELECTED_REGION_NAME, executive.getRegionName());
					setRequestAttribute(request, PRESELECTED_SUBREGION_NAME, executive.getSubRegionName());
					setRequestAttribute(request, PRESELECTED_BRANCH_NAME, executive.getBranchName());
				}
			}
			}
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set executive boolean in request attribute
	public static void setExecutiveBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_BRANCHADMIN, true);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_EXECUTIVE, true);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set group admin boolean in request attribute
	public static void setGroupAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, true);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set region admin boolean in request attribute
	public static void setRegionAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, true);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set sub region admin boolean in request attribute
	public static void setSubRegionAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, true);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that Process the steps to catch exception for JSON Request
	public static void catchJSONException(final JSONObject jsonObjectOut,final PrintWriter out){
		try {
			jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			out.println(jsonObjectOut);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that Process the steps to catch exception for action class
	public static void catchActionException(final HttpServletRequest request, final Exception exception) {
		try {
			ExceptionProcess.execute(exception, TRACE_ID);

			final var error	= new HashMap<>();
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);

			setRequestAttribute(request, "cargoError", error);
			setNextPageToken(request, FAILURE);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that Process the steps for set regions , sub regions , branches in request for perticular executive type
	public static void setInitializeBranchesSelectionInRequest(final HttpServletRequest request, final Executive executive) throws Exception {
		Branch		execBranch						= null;
		var		bothTypeBranchesBySubRegionId		= false;

		try {
			if(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED) != null)
				bothTypeBranchesBySubRegionId	= Utility.getBoolean(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				getRegionsByGroupId(request, executive, true);
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId(), true);
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				execBranch 	= getGenericBranchDetailCache(request, executive.getBranchId());

				if(bothTypeBranchesBySubRegionId)
					getBothTypeBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId(),true);
				else
					getPhysicalBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId(),true);
			} else {
				execBranch 	= getGenericBranchDetailCache(request, executive.getBranchId());

				if(request.getAttribute(ActionStaticUtil.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW) != null)
					getAssignedLocationsByLocationId(request, executive.getAccountGroupId(), executive.getBranchId(), true);
			}
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that Process the steps for set core report permissions(date picker,excel button) in request
	public static void setExecutiveCoreReportPermissionsInRequest(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	checkPermissionsAL	= new ArrayList<Long>();
			checkPermissionsAL.add(FeildPermissionsConstant.DATEPICKER_FOR_TODATE_SELECT);
			checkPermissionsAL.add(FeildPermissionsConstant.EXCEL_BUTTON);

			final var		cacheManip		= new CacheManip(request);

			final var	exeFldPermissions = cacheManip.getExecutiveFieldPermission(request);

			if(exeFldPermissions == null)
				return;

			final var	permissionWiseAccessHM = isPermissionsAllowed(request, exeFldPermissions, checkPermissionsAL);

			if(ObjectUtils.isEmpty(permissionWiseAccessHM))
				return;

			setExecutiveAllowedPermissions(request, permissionWiseAccessHM);
			setRequestAttribute(request, "currentDate", DateTimeUtility.getCurrentDateString());
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static boolean isPermissionExist(final HttpServletRequest request, final Map<String, String> parameteres, final HashMap<String, Object> error, final Executive executive) {
		try {
			final var 	cManip						= new CacheManip(request);
			final var	generalConfiguration		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			final var	restrictToAccessOperations	= (boolean) generalConfiguration.getOrDefault(GeneralConfigurationPropertiesConstant.CENTRALIZED_RESTRICTION_TO_ACCESS_OPERATIONS, false);

			if(!restrictToAccessOperations) return true;

			final var moduleName	= parameteres.get(StringUtils.lowerCase(Constant.MODULE_NAME));

			if(isWS(parameteres) && moduleName == null) {
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Dead Link, Clear browser history and try again !");
				request.setAttribute("error", error);
				return false;
			}

			final var	execFuncHM	= cManip.getExecFunctions(request);
			final var 	businessMap	= cManip.getBusinessFunctions(request);

			if(businessMap.containsKey(moduleName) && !execFuncHM.containsKey(moduleName)) {
				getErrorMessageForPermission(error, businessMap, request, moduleName, executive);
				return false;
			}

			final var surl	= Constant.PAGE_ID + "=" + parameteres.get(Constant.PAGE_ID) + "&" + Constant.EVENT_ID + "=" + parameteres.get(Constant.EVENT_ID);
			final var bf	= ListFilterUtility.findFirstItemOrNull(new ArrayList<>(businessMap.values()), e -> e.getUrl() != null && StringUtils.endsWith(e.getUrl(), surl));

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "surl = " + surl);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "bf = " + bf);

			if(bf != null && bf.getUniqueName() != null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "uniqueName = " + bf.getUniqueName());
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "keys = " + execFuncHM.keySet().stream().collect(Collectors.toList()));

				if(MenuGroupConstant.isReport(bf.getMenuGroupId()) && !execFuncHM.containsKey(BusinessFunctionConstants.REPORT) && !execFuncHM.containsKey(BusinessFunctionConstants.NEWREPORT)) {
					getErrorMessageForPermission(error, businessMap, request, BusinessFunctionConstants.REPORT, executive);
					return false;
				}

				if(ListFilterUtility.isNoElementInList(execFuncHM.keySet().stream().collect(Collectors.toList()), e -> StringUtils.equalsIgnoreCase(e, bf.getUniqueName()))) {
					getErrorMessageForPermission(error, businessMap, request, bf.getUniqueName(), executive);
					return false;
				}
			}

			return true;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return false;
	}

	/*
	 * private boolean isPageAvoidToCheck(final Map<String, String> parameteres) {
	 * return Utility.getInt(parameteres.get(Constant.PAGE_ID)) == 9 &&
	 * Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 16 //Ajax Action (not
	 * business function) || Utility.getInt(parameteres.get(Constant.PAGE_ID)) == 0
	 * && Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 0 //Home page ||
	 * Utility.getInt(parameteres.get(Constant.PAGE_ID)) == 26 &&
	 * Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 2 //Welcome page ||
	 * Utility.getInt(parameteres.get(Constant.PAGE_ID)) == 360 &&
	 * Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 1 //Otp page ; }
	 */

	private static boolean isWS(final Map<String, String> parameteres) {
		//module
		//report
		//dashboard
		//tce
		return Utility.getInt(parameteres.get(Constant.PAGE_ID)) == 340
				&& (Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 1
				|| Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 3
				|| Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 12
				|| Utility.getInt(parameteres.get(Constant.EVENT_ID)) == 13);
	}

	//Method that Process the steps to catch exception for action class
	public static void catchActionException(final HttpServletRequest request, HashMap<String, Object> error, final String errorMessage) {
		try {
			if(error == null)
				error	= new HashMap<>();

			error.put(CargoErrorList.ERROR_DESCRIPTION, errorMessage);
			request.setAttribute("error", error);
			setNextPageToken(request, FAILURE);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that check logged in executive type and set true value in particular boolean
	private static void setExecutiveTypeBoolean(final Executive executive) throws Exception {
		try {
			EXECUTIVE_TYPE_GROUPADMIN		= isExecutiveType(executive.getExecutiveType(), Executive.EXECUTIVE_TYPE_GROUPADMIN);
			EXECUTIVE_TYPE_REGIONADMIN		= isExecutiveType(executive.getExecutiveType(), Executive.EXECUTIVE_TYPE_REGIONADMIN);
			EXECUTIVE_TYPE_SUBREGIONADMIN	= isExecutiveType(executive.getExecutiveType(), Executive.EXECUTIVE_TYPE_SUBREGIONADMIN);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id on the basis  of executive type
	public static ValueObject reportSelection(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			setExecutiveTypeBoolean(executive);

			if(EXECUTIVE_TYPE_GROUPADMIN)
				return reportSelectionForGroupAdmin(request, executive);

			if(EXECUTIVE_TYPE_REGIONADMIN)
				return reportSelectionForRegionAdmin(request, executive);

			if(EXECUTIVE_TYPE_SUBREGIONADMIN)
				return reportSelectionForSubRegionAdmin(request, executive);

			return reportSelectionForExecutive(request, executive);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			setDefaultValuesInAllBoolean();
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is group admin
	public static ValueObject reportSelectionForGroupAdmin(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", JSPUtility.GetLong(request, "region", 0));
			valObj.put("subRegionId", JSPUtility.GetLong(request, "subRegion", 0));
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			getSubRegionsByRegionId(request, JSPUtility.GetLong(request, "region", 0), executive.getAccountGroupId(), true);
			getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), JSPUtility.GetLong(request, "subRegion", 0), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is region admin
	public static ValueObject reportSelectionForRegionAdmin(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", JSPUtility.GetLong(request, "subRegion", 0));
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId(), true);
			getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), JSPUtility.GetLong(request, "subRegion", 0), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is sub region admin
	public static ValueObject reportSelectionForSubRegionAdmin(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", executive.getSubRegionId());
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			if(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED) != null)
				getBothTypeBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId(), true);
			else
				getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId(), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is executive
	public static ValueObject reportSelectionForExecutive(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", executive.getSubRegionId());
			valObj.put("branchId", executive.getBranchId());

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void setRegionForGroup(final HttpServletRequest request, final CacheManip cache, final Executive executive) throws Exception {
		request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
	}

	public static void setExecutiveTypeBooleanInRequest(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN, executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN, executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_BRANCHADMIN, executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN);
			setRequestAttribute(request, ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_EXECUTIVE, executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}