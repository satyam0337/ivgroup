/**
 *
 */
package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.TollMasterBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.dto.truckhisabmodule.TollTypeRateMaster;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class TollMasterAction implements Action {

	private static final String TRACE_ID = "TollMasterAction";

	/**
	 * Json Action For getting all branches of Deliver and Both type
	 * */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	 						error 		= null;

		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;

		short											filter							= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();

			filter					= Utility.getShort(getJsonObject.get("Filter"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}

			switch (filter) {
			case 1:
				out.println(insertTollMaster(request, outJsonObject, getJsonObject));
				break;
			case 2:
				out.println(getTollMaster(request, outJsonObject));
				break;
			case 3:
				out.println(updateTollMaster(outJsonObject, getJsonObject));
				break;
			case 4:
				out.println(deteleFromTollMasterByTollMasterId(outJsonObject, getJsonObject));
				break;
			case 5:
				out.println(getTollType(request, outJsonObject));
				break;
			case 6:
				out.println(getVehicleType(request, outJsonObject));
				break;
			case 7:
				out.println(getTollMasterSettlement(request, outJsonObject, getJsonObject));
				break;
			case 8:
				out.println(mapVehicleTypeToll(request, outJsonObject, getJsonObject));
				break;
			case 9:
				out.println(checkForDuplicateToll(request, outJsonObject, getJsonObject));
				break;
			default:
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				break;
			}


		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
			outJsonObject			= null;

		}
	}

	private JSONObject deteleFromTollMasterByTollMasterId(final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub

		ValueObject 		valueObjectToBLL 		= null;
		ValueObject 		valueObjectFromBLL 		= null;
		TollMasterBLL 		tollMasterBll			= null;
		var 						 flag			= 0L;
		try{

			valueObjectToBLL = new ValueObject();
			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));

			tollMasterBll			= new TollMasterBLL();

			valueObjectFromBLL	= tollMasterBll.deteleTollTypeDetails(valueObjectToBLL);
			flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));

			if(flag > 0)
				outJsonObject.put("Sucess", "Sucess");
			else
				outJsonObject.put("error", "error");

			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}
	}

	private JSONObject updateTollMaster(final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject 				 valueObjectToBLL 			= null;
		ValueObject 				 valueObjectFromBLL 		= null;
		TollMasterBLL 				 tollMasterBll 				= null;
		var 						 flag						= 0L;
		try{
			valueObjectToBLL = new ValueObject();

			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));
			valueObjectToBLL.put("Amount", Utility.getLong(getJsonObject.get("Amount1")));

			tollMasterBll			= new TollMasterBLL();

			valueObjectFromBLL	= tollMasterBll.updateTollTypeDetails(valueObjectToBLL);
			flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));

			if(flag > 0)
				outJsonObject.put("Sucess", "Sucess");
			else
				outJsonObject.put("error", "error");

			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}

	}

	@SuppressWarnings("unchecked")
	private JSONObject getTollMaster(final HttpServletRequest request, final JSONObject outJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   =  	null;
		final ValueObject										valueObjectToBLL     =  	null;
		Executive										executive	  		 = 		null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		 = 		null;
		TollMasterBLL									tollMasterBll		 =		null;
		ArrayList<TollTypeRateMaster>					tollMasterList		 =      null;

		try{

			executive		= (Executive) request.getSession().getAttribute("executive");
			tollMasterBll   = new TollMasterBLL();
			tollMasterList	= new ArrayList<>();
			commonFun		= new CommonFuctionToConvertArrayListToJSONArray();

			valueObjectFromBLL	= tollMasterBll.getTollTypeDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			tollMasterList      = (ArrayList<TollTypeRateMaster>) valueObjectFromBLL.get("tollMasterList");

			if(ObjectUtils.isNotEmpty(tollMasterList))
				outJsonObject.put("tollMasterListColl", commonFun.getTollMasterJSONArrayObject(tollMasterList));

			outJsonObject.put("executive",new JSONObject(executive));

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getTollMasterSettlement(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   =  	null;
		ValueObject										valueObjectToBLL     =  	null;
		Executive										executive	  		 = 		null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		 = 		null;
		TollMasterBLL									tollMasterBll		 =		null;
		ArrayList<TollTypeRateMaster>					tollMasterList		 =      null;
		TollTypeRateMaster								tollTypeRateMaster	 =      null;

		try{

			executive		= (Executive) request.getSession().getAttribute("executive");
			tollMasterBll   = new TollMasterBLL();
			valueObjectToBLL = new ValueObject();
			tollMasterList	= new ArrayList<>();
			commonFun		= new CommonFuctionToConvertArrayListToJSONArray();
			tollTypeRateMaster = new TollTypeRateMaster();
			tollTypeRateMaster.setVehicleTypeId(Utility.getLong(getJsonObject.get("VehicleTypeId")));

			valueObjectToBLL.put("tollTypeRateMaster", tollTypeRateMaster);


			valueObjectFromBLL	= tollMasterBll.getTollTypeDetailsSettlement(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			tollMasterList      = (ArrayList<TollTypeRateMaster>) valueObjectFromBLL.get("tollMasterList");

			if(ObjectUtils.isNotEmpty(tollMasterList))
				outJsonObject.put("tollMasterListColl1", commonFun.getTollMasterJSONArrayObject(tollMasterList));

			outJsonObject.put("executive",new JSONObject(executive));
			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/**
	 *
	 */
	private JSONObject mapVehicleTypeToll(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   = null;
		ValueObject										valueObjectToBLL     = null;
		Executive										executive	  		 = null;
		TollMasterBLL									tollMasterBll		 = null;
		JSONArray										vehicleTypeArr		 = null;
		JSONObject										jSONObject			 = null;
		ArrayList<Long>									vehicleTypeIdsList	 = null;
		var											isSucess			 = false;
		var											tollTypeId	 		 = 0L;
		var											mapAmount	 		 = 0L;


		try{

			executive			= (Executive) request.getSession().getAttribute("executive");
			tollMasterBll   	= new TollMasterBLL();
			valueObjectToBLL 	= new ValueObject();
			vehicleTypeIdsList 	= new ArrayList<>();

			vehicleTypeArr =  getJsonObject.getJSONArray("VehicleIdArry1");

			if(getJsonObject.get("TollType") != null)
				tollTypeId = Utility.getLong(getJsonObject.get("TollType"));
			if(getJsonObject.get("MapAmount") != null)
				mapAmount = Utility.getLong(getJsonObject.get("MapAmount"));

			if(vehicleTypeArr != null)
				for(var i = 0; i < vehicleTypeArr.length(); i++){
					jSONObject = new JSONObject();
					jSONObject = vehicleTypeArr.getJSONObject(i);
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@id "+Utility.getLong(jSONObject.get("id")));
					vehicleTypeIdsList.add(Utility.getLong(jSONObject.get("id")));
				}




			valueObjectToBLL.put("tollTypeId",tollTypeId);
			valueObjectToBLL.put("vehicleTypeIdsList",vehicleTypeIdsList);
			valueObjectToBLL.put("mapAmount", mapAmount);

			valueObjectFromBLL	= tollMasterBll.insertMap(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			isSucess      = Utility.getBoolean( valueObjectFromBLL.get("sucess"));

			if(isSucess){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@isSucess1@@ "+isSucess);
				outJsonObject.put("sucess", "sucess");
				outJsonObject.put("executive",new JSONObject(executive));
			}
			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}finally {

		}
	}


	private JSONObject insertTollMaster(final HttpServletRequest request, final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		TollMasterBLL									tollMasterBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;
		JSONObject										newJsonObject					= null;
		JSONArray										jsonArr							= null;
		TollTypeRateMaster								tollTypeRateMaster				= null;
		ArrayList<TollTypeRateMaster> 					tollTypeRateMasterList			= null;
		String											name							= null;
		try{

			valueObjectToBLL		= new ValueObject();
			tollTypeRateMasterList	= new ArrayList<>();

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());
			name	= getJsonObject.get("Name")+"";
			valueObjectToBLL.put("Name", name.toUpperCase());
			valueObjectToBLL.put("Amount", Utility.getLong(getJsonObject.get("Amount")));

			jsonArr = getJsonObject.getJSONArray("SelectedTypeIdNameArray");

			for(var i = 0; i < jsonArr.length(); i++) {

				newJsonObject	= jsonArr.getJSONObject(i);

				tollTypeRateMaster	= new TollTypeRateMaster();
				tollTypeRateMaster.setAccountGroupId(executive.getAccountGroupId());
				tollTypeRateMaster.setVehicleTypeId(Utility.getLong(newJsonObject.get("id")));
				tollTypeRateMaster.setAmount(Utility.getLong(getJsonObject.get("Amount")));

				tollTypeRateMasterList.add(tollTypeRateMaster);
			}

			if(tollTypeRateMasterList != null && tollTypeRateMasterList.size() >  0)
				valueObjectToBLL.put("tollTypeRateMasterList", tollTypeRateMasterList);

			tollMasterBll			= new TollMasterBLL();

			valueObjectFromBLL	= tollMasterBll.insertTollMaster(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			if((int[])valueObjectFromBLL.get("count") != null ) {
				outJsonObject.put("Success", true);
				outJsonObject.put("executive",new JSONObject(executive));
			}

			return 	outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {

		}

	}


	private JSONObject getTollType(final HttpServletRequest request, JSONObject outJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   =  	null;
		final ValueObject										valueObjectToBLL     =  	null;
		TollMasterBLL									tollMasterBll		 =		null;

		try{

			tollMasterBll   = new TollMasterBLL();

			valueObjectFromBLL	= tollMasterBll.getTollDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			outJsonObject = JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@outJsonObject123 "+outJsonObject);

			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}finally {

		}
	}

	private JSONObject getVehicleType(final HttpServletRequest request, JSONObject outJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   =  	null;
		final ValueObject										valueObjectToBLL     =  	null;
		TollMasterBLL									tollMasterBll		 =		null;

		try{

			tollMasterBll   = new TollMasterBLL();

			valueObjectFromBLL	= tollMasterBll.getVehicleDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			outJsonObject = JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@outJsonObject1235 "+outJsonObject);

			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}finally {

		}
	}

	private JSONObject checkForDuplicateToll(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   = null;
		ValueObject										valueObjectToBLL     = null;
		Executive										executive	  		 = null;
		TollMasterBLL									tollMasterBll		 = null;
		var											isSucess			 = false;
		String											tollName	 		 = null;

		try{

			executive			= (Executive) request.getSession().getAttribute("executive");
			tollMasterBll   	= new TollMasterBLL();
			valueObjectToBLL 	= new ValueObject();

			if(getJsonObject.get("TollnameToCheck") != null)
				tollName = getJsonObject.get("TollnameToCheck")+"";

			valueObjectToBLL.put("tollName",tollName);

			valueObjectFromBLL	= tollMasterBll.checkForDuplicateEntry(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			isSucess      = Utility.getBoolean( valueObjectFromBLL.get("sucess"));

			if(isSucess){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@isSucess1@@ "+isSucess);
				outJsonObject.put("sucess", "sucess");
			}else{
				outJsonObject.put("sucess", "error");
			}
			outJsonObject.put("executive",new JSONObject(executive));
			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}finally {

		}
	}


}
