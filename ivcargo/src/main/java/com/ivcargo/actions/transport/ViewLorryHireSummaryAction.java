package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LorryHireSummaryBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class ViewLorryHireSummaryAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 								= null;
		Executive        					executive      			= null;
		CacheManip 							cManip 					= null;
		ValueObject                      	outValueObject         	= null;
		HashMap<Long,Branch>			 	allGroupBranches 	    = null;
		ValueObject						 	inValueObject			= null;
		HashMap<Long,VehicleNumberMaster>	vehicleNumberHM			= null;
		PrintWriter							out						= null;
		LorryHireSummaryBLL					lorryHireSummaryBLL		= null;
		StringBuilder						lorryHireSummaryStrBuffer= null;
		long								lorryHireId				= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);
			lorryHireSummaryStrBuffer = new StringBuilder();
			lorryHireId	 = JSPUtility.GetLong(request, "lorryHireId",0);

			if(lorryHireId > 0){
				allGroupBranches = cManip.getAllGroupBranches(request, executive.getAccountGroupId());
				vehicleNumberHM  = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				inValueObject = new ValueObject();
				inValueObject.put("allGroupBranches",allGroupBranches);
				inValueObject.put("vehicleNumberHM",vehicleNumberHM);
				inValueObject.put("lorryHireId",lorryHireId);

				lorryHireSummaryBLL = new LorryHireSummaryBLL();
				outValueObject 	    = lorryHireSummaryBLL.getLorryHireSummaryByLorryHireId(inValueObject);

				if(outValueObject != null)
					lorryHireSummaryStrBuffer = (StringBuilder)outValueObject.get("lorryHireSummaryStrBuffer");
				else {
					lorryHireSummaryStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				lorryHireSummaryStrBuffer.append("Error :"+CargoErrorList.REPORT_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			out = response.getWriter();
			out.println(lorryHireSummaryStrBuffer.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			out.close();
			executive      		= null;
			cManip 				= null;
			outValueObject      = null;
			allGroupBranches 	= null;
			inValueObject		= null;
			vehicleNumberHM		= null;
			lorryHireSummaryBLL	= null;
			lorryHireSummaryStrBuffer = null;
		}
	}
}