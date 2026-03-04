package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LorryHireBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;

public class LorryHireCancellationAction implements Action {

	public static final String TRACE_ID = "LorryHireCancellationAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		ValueObject 		inValObj			= null;
		LorryHireBLL		lorryHireBLL		= null;
		Executive			executive			= null;
		String				cancellationRemark	= null;
		PrintWriter			out					= null;	
		StringBuffer		responseStrBuffer	= null;
		long				lorryHireId			= 0;
		short				filter				= 0;
		long				vehicleNumberMasterId = 0;
		CacheManip			cache				= null;
		HashMap<Long,VehicleNumberMaster>		vehicleObj				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			response.setContentType("text/plain");
			executive			= (Executive) request.getSession().getAttribute("executive");
			lorryHireId			= JSPUtility.GetLong(request, "selectedLorryHireId", 0);
			cancellationRemark	= JSPUtility.GetString(request, "cancellationRemark", "");
			vehicleNumberMasterId	= JSPUtility.GetLong(request, "vehicleNumberMasterId", 0);
			cache				= new CacheManip(request);
			responseStrBuffer   = new StringBuffer();

			filter				= 3;
			inValObj			= new ValueObject();
			lorryHireBLL		= new LorryHireBLL();
			vehicleObj		= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());
			inValObj.put("lorryHireId", lorryHireId);
			inValObj.put("vehicleObj", vehicleObj);
			inValObj.put("executive", executive);
			inValObj.put("cancellationRemark", cancellationRemark);
			inValObj.put("vehicleNumberMasterId", vehicleNumberMasterId);
			lorryHireBLL.lorryHireCancellationProcess(inValObj);

			responseStrBuffer.append(filter);
			out = response.getWriter();
			out.println(responseStrBuffer.toString());
			out.flush();
			
			//response.sendRedirect("LorryHireAfterCreation.do?pageId=234&eventId=3&lorryHireId="+lorryHireId+"&filter="+filter);

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.close();
			inValObj			= null;
			lorryHireBLL		= null;
			executive			= null;
			cache				= null;
			vehicleObj			= null;
		}
	}
}