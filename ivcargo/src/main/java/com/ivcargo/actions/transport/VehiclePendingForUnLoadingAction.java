package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehiclePendingForUnLoadinglBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehiclePendingForUnLoading;
import com.platform.resource.CargoErrorList;

public class VehiclePendingForUnLoadingAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		Executive        				 	executive      						= null;
		CacheManip 						 	cManip 								= null;
		HashMap<Long,Branch>			 	allGroupBranches 	    			= null;
		ValueObject						 	inValueObject						= null;
		HashMap<Long,VehicleNumberMaster>	vehicleNumberHM						= null;
		ArrayList<Long>       			 	executiveAssignedLocationIdList 	= null;
		String							 	branchIds		    				= null;
		StringBuilder						vehiclePendingForUnloadingStrBuffer = null;
		PrintWriter						 	out									= null;
		final short							filter								= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);
			vehiclePendingForUnloadingStrBuffer = new StringBuilder();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cManip, executive);

			executiveAssignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(!executiveAssignedLocationIdList.contains(executive.getBranchId()))
				executiveAssignedLocationIdList.add(executive.getBranchId());

			if(branchIds != null && branchIds.length() > 0){
				allGroupBranches = cManip.getAllGroupBranches(request, executive.getAccountGroupId());
				vehicleNumberHM  = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				inValueObject = new ValueObject();
				inValueObject.put("allGroupBranches",allGroupBranches);
				inValueObject.put("vehicleNumberHM",vehicleNumberHM);
				inValueObject.put("branchIds",branchIds);
				inValueObject.put("executiveAssignedLocationIdList",executiveAssignedLocationIdList);
				inValueObject.put("status",VehiclePendingForUnLoading.STATUS_PENDING_UNLOADING);
				inValueObject.put("filter",filter);

				vehiclePendingForUnloadingStrBuffer = VehiclePendingForUnLoadinglBLL.getInstance().getVehiclePendingForUnLoading(inValueObject);

				if(vehiclePendingForUnloadingStrBuffer == null){
					vehiclePendingForUnloadingStrBuffer	= new StringBuilder();
					vehiclePendingForUnloadingStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				vehiclePendingForUnloadingStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			out = response.getWriter();
			out.println(vehiclePendingForUnloadingStrBuffer.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.close();
			executive      						= null;
			cManip 								= null;
			allGroupBranches 	    			= null;
			inValueObject						= null;
			vehicleNumberHM						= null;
			executiveAssignedLocationIdList 	= null;
		}
	}
}
