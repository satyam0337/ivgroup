package com.ivcargo.reports;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.reports.dispatch.CitywiseVehicleNumberDispatchBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.VehicleNumberWiseDispatchModel;
import com.platform.utils.Utility;

public class CitywiseVehicleNumberWiseDispatchDataAction implements Action{

	private static final String TRACE_ID = "CitywiseVehicleNumberWiseDispatchDataAction";
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 			error 						= null;
		Executive							executive					= null;
		HashMap<Long,String>				subRegion					= null;
		CacheManip							cache						= null;
		Timestamp        					fromDate    				= null;
		String	        					fromDateString   			= null;
		String	        					toDateString   				= null;
		Timestamp        					toDate      				= null;
		StringBuffer						sourceBranchesString		= null;
		StringBuffer						destinationBranchesString	= null;
		ValueObject							valueInObject				= null;
		ValueObject							valueOutObject				= null;
		CitywiseVehicleNumberDispatchBLL 	vehcileNUmberbll			= null;
		ArrayList<VehicleNumberWiseDispatchModel> finalVehicleNumberColl 			= null;
		VehicleNumberWiseDispatchModel[] finalVehicleNumberArr 			= null;
		PrintWriter						out							= null;

		JSONObject			jsonObjectGet		= null;
		long 				fromSubRegion			= 0;
		long 				toSubRegion				= 0;
		long				selectedVehicleNo	= 0;
		long 				startTime 			= 0;
		JSONObject			jsonObjectOut		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}


			jsonObjectGet 	= new JSONObject(request.getParameter("json"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "jsonObjectGet : "+jsonObjectGet);
			selectedVehicleNo 	= Utility.getLong(jsonObjectGet.get("selectedVehicleNo")); 
			fromSubRegion 			= Utility.getLong(jsonObjectGet.get("fromSubRegion"));
			toSubRegion 				= Utility.getLong(jsonObjectGet.get("toSubRegion"));
			fromDateString 		= jsonObjectGet.get("fromDate").toString();
			toDateString 		= jsonObjectGet.get("toDate").toString();
			out					= response.getWriter();
			//toDate 				= Utility.getTimestamp(jsonObjectGet.get("toDate"));

			/*selectedVehicleNo 	= JSPUtility.GetLong(request, "selectedVehicleNo"); 
			fromCity 			= JSPUtility.GetLong(request, "fromCity");
			toCity 				= JSPUtility.GetLong(request, "toCity");*/

			if(request.getAttribute("fromSubRegion") != null){
				fromSubRegion 			= JSPUtility.GetLong(request, "fromSubRegion");
			}
			if(request.getAttribute("toSubRegion") != null){
				toSubRegion 				= JSPUtility.GetLong(request, "toSubRegion");
			}
			startTime = System.currentTimeMillis();
			new CitywiseVehicleNumberWiseDispatchInitializeAction().execute(request, response);
			cache		= new CacheManip(request);

			executive		= ActionStaticUtil.getExecutive(request);
			fromDate		= ActionStaticUtil.getFromToDatetFromString(fromDateString, ActionStaticUtil.FROMTIME);
			toDate			= ActionStaticUtil.getFromToDatetFromString(toDateString, ActionStaticUtil.TOTIME);

			/*if(request.getAttribute("cityList")!= null){
				cityList		= (HashMap<Long, String>) request.getAttribute("cityList");
			}
*/
			sourceBranchesString = new StringBuffer();
			if(fromSubRegion == 0) {
				sourceBranchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));
			} else {
				sourceBranchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, fromSubRegion));
			}

			destinationBranchesString = new StringBuffer();
			if(toSubRegion == 0) {
				destinationBranchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));
			} else {
				destinationBranchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, toSubRegion));
			}
			valueInObject = new ValueObject();

			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("sourceBranchesString", sourceBranchesString);
			valueInObject.put("destinationBranchesString", destinationBranchesString);
			valueInObject.put("selectedVehicleNo", selectedVehicleNo);
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("subRegion", subRegion);
			valueInObject.put("branchColl", cache.getGenericBranchesDetail(request));

			ActionStaticUtil.setRequestAttribute(request, "subRegion", subRegion);

			vehcileNUmberbll = new CitywiseVehicleNumberDispatchBLL();
			valueOutObject = vehcileNUmberbll.getDataFromReport(valueInObject);

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "valueOutObject : "+valueOutObject);

			if(valueOutObject == null || valueOutObject.get("sourceSubRegionMap") == null){
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				ActionStaticUtil.getReportElapsedTime(TRACE_ID,executive,startTime);
				return;
			}

			finalVehicleNumberColl	= (ArrayList<VehicleNumberWiseDispatchModel>) valueOutObject.get("finalVehicleNumberColl");
			finalVehicleNumberArr = new VehicleNumberWiseDispatchModel[finalVehicleNumberColl.size()];
			finalVehicleNumberColl.toArray(finalVehicleNumberArr);
			jsonObjectOut		= new JSONObject();

			jsonObjectOut.put("finalJsonArr", arrayDtotoJson(finalVehicleNumberArr));

			out.println(jsonObjectOut);

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setRequestAttribute(request, "sourceSubRegionMap", valueOutObject.get("sourceSubRegionMap"));
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			out.flush();
			out.close();
			jsonObjectOut		= null;
			error 						= null;
			executive					= null;
			subRegion					= null;
			cache						= null;
			fromDate    				= null;
			toDate      				= null;
			sourceBranchesString		= null;
			destinationBranchesString	= null;
			valueInObject				= null;
			valueOutObject				= null;
			vehcileNUmberbll			= null;
		}
	}

	private JSONArray arrayDtotoJson (Object[] objects) throws Exception {

		JSONArray jsonObject	= null;

		try {

			jsonObject	= new JSONArray();

			for (int i = 0; i < objects.length; i++) {
				jsonObject.put(new JSONObject(objects[i]));
			}

			return jsonObject;

		} catch (Exception e) {
			throw e;
		} finally {
			jsonObject	= null;
		}
	}

}
