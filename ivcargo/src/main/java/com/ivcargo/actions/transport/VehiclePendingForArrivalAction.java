package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehiclePendingForArrivalBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class VehiclePendingForArrivalAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;

		Executive        				 	executive      					= null;
		CacheManip 						 	cManip 							= null;
		ValueObject                      	outValueObject         			= null;
		HashMap<Long,Branch>			 	allGroupBranches 	    		= null;
		ValueObject						 	inValueObject					= null;
		HashMap<Long,VehicleNumberMaster>	vehicleNumberHM					= null;
		VehiclePendingForArrivalBLL			vehiclePendingForArrivalBLL 	= null;
		ArrayList<Long>       				executiveAssignedLocationIdList = null;
		String							 	routeBranchIds		    		= null;
		PrintWriter							out								= null;
		StringBuilder						vehiclePendingForArrivalStrBuffer= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);
			vehiclePendingForArrivalStrBuffer = new StringBuilder();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			routeBranchIds	= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cManip, executive);

			executiveAssignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(!executiveAssignedLocationIdList.contains(executive.getBranchId()))
				executiveAssignedLocationIdList.add(executive.getBranchId());

			if(routeBranchIds != null && routeBranchIds.length() > 0){
				allGroupBranches = cManip.getAllGroupBranches(request, executive.getAccountGroupId());
				vehicleNumberHM  = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				inValueObject = new ValueObject();
				inValueObject.put("allGroupBranches",allGroupBranches);
				inValueObject.put("vehicleNumberHM",vehicleNumberHM);
				inValueObject.put("branchIds",routeBranchIds);
				inValueObject.put("executiveAssignedLocationIdList",executiveAssignedLocationIdList);
				inValueObject.put("executive",executive);

				vehiclePendingForArrivalBLL = new VehiclePendingForArrivalBLL();
				outValueObject = vehiclePendingForArrivalBLL.getPendingVehicleForArrivalByRouteBranchId(inValueObject);

				if(outValueObject != null)
					vehiclePendingForArrivalStrBuffer = (StringBuilder)outValueObject.get("vehiclePendingForArrivalStrBuffer");
				else {
					vehiclePendingForArrivalStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				vehiclePendingForArrivalStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			out = response.getWriter();
			out.println(vehiclePendingForArrivalStrBuffer.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.close();
			executive      					= null;
			cManip 							= null;
			outValueObject         			= null;
			allGroupBranches 	    		= null;
			inValueObject					= null;
			vehicleNumberHM					= null;
			vehiclePendingForArrivalBLL 	= null;
			executiveAssignedLocationIdList = null;
		}
	}
}
