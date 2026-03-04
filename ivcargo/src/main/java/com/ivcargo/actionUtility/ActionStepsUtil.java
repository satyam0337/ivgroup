package com.ivcargo.actionUtility;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONObject;

import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ActionStepsUtil {

	private static final String TRACE_ID	= "ActionStepsUtil";

	//Method that Process the steps for set regions , sub regions , branches in request for perticular executive type
	public static void setInitializeBranchesSelectionInRequest(final HttpServletRequest request, final Executive executive) throws Exception {
		Branch		execBranch						= null;
		var		bothTypeBranchesBySubRegionId		= false;
		var		showRegionSelectionForRegionAdmin	= false;


		try {
			if(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED) != null)
				bothTypeBranchesBySubRegionId	= Utility.getBoolean(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED));

			if(request.getAttribute(ActionStaticUtil.SHOW_REGION_SELECTION_FOR_REGION_ADMIN) != null)
				showRegionSelectionForRegionAdmin	= Utility.getBoolean(request.getAttribute(ActionStaticUtil.SHOW_REGION_SELECTION_FOR_REGION_ADMIN));

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN || showRegionSelectionForRegionAdmin)
				ActionStaticUtil.getRegionsByGroupId(request, executive, true);
			else if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_REGIONADMIN)
				ActionStaticUtil.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId(),true);
			else if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				execBranch 	= ActionStaticUtil.getGenericBranchDetailCache(request, executive.getBranchId());

				if(bothTypeBranchesBySubRegionId)
					ActionStaticUtil.getBothTypeBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId(),true);
				else
					ActionStaticUtil.getPhysicalBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId(),true);
			} else {
				execBranch 	= ActionStaticUtil.getGenericBranchDetailCache(request, executive.getBranchId());

				if(request.getAttribute(ActionStaticUtil.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW) != null)
					ActionStaticUtil.getAssignedLocationsByLocationId(request, executive.getAccountGroupId(), executive.getBranchId(), true);
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

			final var	permissionWiseAccessHM = ActionStaticUtil.isPermissionsAllowed(request, exeFldPermissions, checkPermissionsAL);

			if(permissionWiseAccessHM == null || permissionWiseAccessHM.size() <= 0)
				return;

			ActionStaticUtil.setExecutiveAllowedPermissions(request, permissionWiseAccessHM);

			ActionStaticUtil.setRequestAttribute(request, "currentDate", DateTimeUtility.getCurrentDateString());
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that Process the steps to catch exception for action class
	public static void catchActionException(final HttpServletRequest request,final Exception exception, HashMap<String,Object> error){
		try {
			exception.printStackTrace();
			ExceptionProcess.execute(exception, TRACE_ID);

			if(error == null)
				error	= new HashMap<>();

			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);

			ActionStaticUtil.setRequestAttribute(request, "cargoError", error);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);

		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
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

	//Method that returns Array of branch ids of given region id / sub region id / branch id
	public static String getAllBranchIdsByUserSelection(final HttpServletRequest request,final CacheManip cManip, final long regionId, final long subRegionId, final long branchId, final long accountGroupId) throws Exception{
		String				branchIds				= null;

		try {
			if(regionId == 0 && subRegionId == 0 && branchId == 0)
				branchIds = cManip.getBranchesStringById(request, accountGroupId, TransportCommonMaster.DATA_GROUP, 0);
			else if(subRegionId == 0 && branchId == 0)
				branchIds = cManip.getBranchesStringById(request, accountGroupId, TransportCommonMaster.DATA_REGION, regionId);
			else if(subRegionId > 0 && branchId == 0)
				branchIds = cManip.getBranchesStringById(request, accountGroupId, TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else if(subRegionId > 0 && branchId > 0) {
				final var	assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, branchId, accountGroupId);

				ActionStaticUtil.addAssignedLocationIds(assignedLocationIdList,branchId);

				branchIds = Utility.GetLongArrayListToString(assignedLocationIdList);
			}

			return branchIds;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static void throwInvalidSessionError(final HttpServletRequest request, HashMap<String, Object> error) {
		if(error == null)
			error	= new HashMap<>();

		error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SESSION_INVALID);
		error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SESSION_INVALID_DESCRIPTION);
		request.setAttribute("error", error);
	}
}