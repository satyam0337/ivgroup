package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehiclePendingForLoadinglBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class VehiclePendingForLoadingAction implements Action {
	private static final String TRACE_ID = "VehiclePendingForLoadingAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;

		Executive        				 	executive      					= null;
		CacheManip 						 	cManip 							= null;
		HashMap<Long,Branch>			 	allGroupBranches 	    		= null;
		ValueObject						 	inValueObject					= null;
		HashMap<Long,VehicleNumberMaster>	vehicleNumberHM					= null;
		PrintWriter						 	out								= null;
		String							 	branchIds		    			= null;
		StringBuilder						vehiclePendingForLoadingStrBuffer = null;
		ArrayList<Long>       			 	exeAssignedLocationIdList 		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			vehiclePendingForLoadingStrBuffer = new StringBuilder();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cManip, executive);

			exeAssignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(!exeAssignedLocationIdList.contains(executive.getBranchId()))
				exeAssignedLocationIdList.add(executive.getBranchId());

			if(branchIds != null && branchIds.length() > 0){
				allGroupBranches = cManip.getAllGroupBranches(request, executive.getAccountGroupId());
				vehicleNumberHM  = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				inValueObject = new ValueObject();
				inValueObject.put("allGroupBranches",allGroupBranches);
				inValueObject.put("vehicleNumberHM",vehicleNumberHM);
				inValueObject.put("branchIds",branchIds);
				inValueObject.put("executive",executive);
				inValueObject.put("exeAssignedLocationIdList",exeAssignedLocationIdList);

				vehiclePendingForLoadingStrBuffer = VehiclePendingForLoadinglBLL.getInstance().getVehiclePendingForLoading(inValueObject);

				if(vehiclePendingForLoadingStrBuffer == null) {
					vehiclePendingForLoadingStrBuffer	= new StringBuilder();
					vehiclePendingForLoadingStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				vehiclePendingForLoadingStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

			out = response.getWriter();
			out.println(vehiclePendingForLoadingStrBuffer.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) out.close();
			executive      					= null;
			cManip 							= null;
			allGroupBranches 	    		= null;
			inValueObject					= null;
			vehicleNumberHM					= null;
		}
	}
}