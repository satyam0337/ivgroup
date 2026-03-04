package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.BranchWiseTrafficBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.BranchWiseTraffic;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class BranchWiseTrafficAction implements Action{

	public static final String TRACE_ID = "BranchWiseTrafficAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive   									executive					= null;
		CacheManip 										cache						= null;
		JSONObject										jsonObjectOut				= null;
		JSONObject										jsonObjectGet				= null;
		BranchWiseTrafficBLL							branchWiseTrafficBLL		= null;
		ValueObject										valObj						= null;
		ValueObject										valOutObj					= null;
		PrintWriter										out							= null;
		HashMap<Long,ArrayList<BranchWiseTraffic>>		branchWiseTrafficHM			= null;
		ArrayList<BranchWiseTraffic>					branchWiseTrafficAL			= null;
		JSONObject										branchWiseTrafficJsonHM		= null;
		JSONArray										branchWiseTrafficJsonAL		= null;
		HashMap<Long,VehicleNumberMaster>				vehicleNumberHM				= null;
		long											regionId					= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			response.setContentType("text/json");
			executive 		= (Executive) request.getSession().getAttribute("executive");
			cache 			= new CacheManip(request);
			jsonObjectGet	= new JSONObject(request.getParameter("json"));

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId 		= Long.parseLong(jsonObjectGet.get("regionId").toString());
			}

			vehicleNumberHM  	= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

			valObj		= new ValueObject();
			valObj.put("executive", executive);
			valObj.put("regionId", regionId);
			valObj.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObj.put("vehicleNumberHM", vehicleNumberHM);

			branchWiseTrafficBLL	= new BranchWiseTrafficBLL();
			valOutObj 				= branchWiseTrafficBLL.getBranchWiseTrafficDetails(valObj);

			out 			= response.getWriter();
			jsonObjectOut	= new JSONObject();

			if(valOutObj == null || valOutObj.get("branchWiseTrafficHM") == null){
				jsonObjectOut.put("error", CargoErrorList.NO_RECORDS_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			// Covert java data to JSON data 
			branchWiseTrafficHM			= (HashMap<Long,ArrayList<BranchWiseTraffic>>)valOutObj.get("branchWiseTrafficHM");
			branchWiseTrafficJsonHM		= new JSONObject();

			for(Long routeBranchId : branchWiseTrafficHM.keySet()){

				branchWiseTrafficAL 	= branchWiseTrafficHM.get(routeBranchId);
				branchWiseTrafficJsonAL = new JSONArray();

				for(int i=0 ; i<branchWiseTrafficAL.size() ; i++){
					branchWiseTrafficJsonAL.put(new JSONObject(branchWiseTrafficAL.get(i)));
				}

				branchWiseTrafficJsonHM.put(routeBranchId.toString(), branchWiseTrafficJsonAL);
			}
			// Covert java data to JSON data 

			jsonObjectOut.put("branchWiseTrafficJsonHM", branchWiseTrafficJsonHM);
			out.println(jsonObjectOut);

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive					= null;
			cache						= null;
			jsonObjectOut				= null;
			jsonObjectGet				= null;
			branchWiseTrafficBLL		= null;
			valObj						= null;
			valOutObj					= null;
			branchWiseTrafficHM			= null;
			branchWiseTrafficAL			= null;
			branchWiseTrafficJsonHM		= null;
			branchWiseTrafficJsonAL		= null;
			vehicleNumberHM				= null;
			out.flush();
			out.close();
			out							= null;
		}
	}
}