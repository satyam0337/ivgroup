package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.EmptyVehicleBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.EmptyVehicle;
import com.platform.dto.Executive;
import com.platform.dto.constant.EmptyVehicleConstant;
import com.platform.resource.CargoErrorList;

public class EmptyVehicleDetailsAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		Executive 				executive			= null;
		CacheManip				cache				= null;
		ValueObject				valObj				= null;
		EmptyVehicle			emptyVehicle		= null;
		EmptyVehicle[]			emptyVehicleArr		= null;
		JSONObject				jsonObjectGet		= null;
		JSONObject				jsonObjOut			= null;
		JSONArray				emptyVehicleJSONArr	= null;
		PrintWriter				out					= null;
		long					regionId			= 0;
		long					subRegionId 		= 0;
		long					srcBranchId 		= 0;
		short					filter				= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}


			response.setContentType("text/json");

			executive		= (Executive)request.getSession().getAttribute("executive");
			cache			= new CacheManip(request);
			jsonObjectGet	= new JSONObject(request.getParameter("json"));

			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

				regionId	= Long.parseLong(jsonObjectGet.get("region").toString());
				subRegionId = Long.parseLong(jsonObjectGet.get("subRegion").toString());
				srcBranchId = Long.parseLong(jsonObjectGet.get("branch").toString());

			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {

				regionId	= executive.getRegionId();
				subRegionId = Long.parseLong(jsonObjectGet.get("subRegion").toString());
				srcBranchId = Long.parseLong(jsonObjectGet.get("branch").toString());

			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {

				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = Long.parseLong(jsonObjectGet.get("branch").toString());

			} else {

				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(regionId == (long)0){
				filter = 1;
			}else if(subRegionId == (long)0){
				filter = 2;
			}else if(srcBranchId == (long)0){
				filter = 3;
			}else{
				filter = 4;
			}

			emptyVehicle	= new EmptyVehicle();
			emptyVehicle.setRegionId(regionId);
			emptyVehicle.setSubRegionId(subRegionId);
			emptyVehicle.setBranchId(srcBranchId);
			emptyVehicle.setFilter(filter);
			emptyVehicle.setAccountGroupId(executive.getAccountGroupId());
			emptyVehicle.setStatus(EmptyVehicleConstant.EMPTY_VEHICLE_STATUS_NOT_ENGAGED);

			valObj = new ValueObject();
			valObj.put("emptyVehicle", emptyVehicle);
			valObj.put("vehicleNumberHM", cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));
			valObj.put("branchesColl", cache.getGenericBranchesDetail(request));

			emptyVehicleArr = EmptyVehicleBLL.getVehicleDetails(valObj);

			jsonObjOut	= new JSONObject();
			out 		= response.getWriter();

			if(emptyVehicleArr == null || emptyVehicleArr.length == 0){
				jsonObjOut.put("error", CargoErrorList.NO_RECORDS_DESCRIPTION);
				out.println(jsonObjOut);
				return;
			}

			emptyVehicleJSONArr = new JSONArray();
			for(int i=0 ; i<emptyVehicleArr.length ; i++){
				emptyVehicleJSONArr.put(new JSONObject(emptyVehicleArr[i]));
			}

			jsonObjOut.put("emptyVehicleJSONArr", emptyVehicleJSONArr);
			out.println(jsonObjOut);

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request,_e, error);
		} finally {
			executive			= null;
			cache				= null;
			valObj				= null;
			emptyVehicle		= null;
			emptyVehicleArr		= null;
			jsonObjOut			= null;
			emptyVehicleJSONArr	= null;
			out.flush();
			out.close();
			out					= null;
		}
	}
}
