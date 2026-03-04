/**
 * 
 */
package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.MiscMasterBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.platform.dto.AccountGroup;
import com.platform.dto.Executive;
import com.platform.dto.truckhisabmodule.MiscTypeMaster;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class MiscMasterAction implements Action {

	private static final String TRACE_ID = "MiscMasterAction";

	/**
	 * Json Action For getting all branches of Deliver and Both type  
	 * */
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	 						error 		= null;
		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;
		short											filter							= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

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
				out.println(insertMiscMaster(request, response, outJsonObject, getJsonObject));
				break;
			case 2:
				out.println(getMiscMaster(request, response, outJsonObject, getJsonObject));
				break;
			case 3:
				out.println(updateMiscMaster(request, response, outJsonObject, getJsonObject));
				break;
			case 4:
				out.println(deteleFromMisc(request, response, outJsonObject, getJsonObject));
				break;

			default:
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				break;
			}

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
			outJsonObject			= null;

		}
	}

	private JSONObject deteleFromMisc(HttpServletRequest request, HttpServletResponse response,
			JSONObject outJsonObject, JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub

		ValueObject 		valueObjectToBLL 		= null;
		ValueObject 		valueObjectFromBLL 		= null;
		MiscMasterBLL 		miscMasterBll			= null;
		long 						 flag			= 0;
		try{

			valueObjectToBLL = new ValueObject();
			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));
			miscMasterBll			= new MiscMasterBLL();

			valueObjectFromBLL	= miscMasterBll.deteleMiscTypeDetails(valueObjectToBLL);
			flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@flag "+flag);
			if(flag > 0){
				outJsonObject.put("Sucess", "Sucess");
			}else{
				outJsonObject.put("error", "error");
			}

			return outJsonObject;	
		}catch(Exception e){
			throw e;
		}
	}

	private JSONObject updateMiscMaster(HttpServletRequest request, HttpServletResponse response, JSONObject outJsonObject,
			JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject 				 valueObjectToBLL 			= null;
		ValueObject 				 valueObjectFromBLL 		= null;
		MiscMasterBLL 				 miscMasterBll 				= null;
		long 						 flag						= 0;
		try{
			valueObjectToBLL = new ValueObject();

			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));
			valueObjectToBLL.put("Name1", getJsonObject.get("Name1")+"");

			miscMasterBll			= new MiscMasterBLL();

			valueObjectFromBLL	= miscMasterBll.updateMiscTypeDetails(valueObjectToBLL);
			flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));

			if(flag > 0){
				outJsonObject.put("Sucess", "Sucess");
			}else{
				outJsonObject.put("error", "error");
			}

			return outJsonObject;
		}catch(Exception e){
			throw e;
		}

	}

	@SuppressWarnings("unchecked")
	private JSONObject getMiscMaster(HttpServletRequest request, HttpServletResponse response, JSONObject outJsonObject,
			JSONObject getJsonObject) throws Exception  {
		// TODO Auto-generated method stub
		ValueObject										valueObjectFromBLL   =  	null;
		Executive										executive	  		 = 		null;	
		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		 = 		null;
		MiscMasterBLL									miscMasterBll		 =		null;
		ArrayList<MiscTypeMaster>						miscMasterList		 =      null;

		try{

			executive		= (Executive) request.getSession().getAttribute("executive");
			miscMasterBll   = new MiscMasterBLL();
			miscMasterList	= new ArrayList<MiscTypeMaster>();
			commonFun		= new CommonFuctionToConvertArrayListToJSONArray();

			valueObjectFromBLL	= miscMasterBll.getMiscTypeDetails(executive.getAccountGroupId());

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			if(valueObjectFromBLL.get("miscMasterList") != null ){
				miscMasterList      = (ArrayList<MiscTypeMaster>) valueObjectFromBLL.get("miscMasterList");
			}
			if(miscMasterList.size() > 0 || miscMasterList != null){
				outJsonObject.put("tollMasterListColl", commonFun.getMiscMasterJSONArrayObject(miscMasterList));
			}			
			outJsonObject.put("executive",new JSONObject(executive));
			return outJsonObject;
		}catch(Exception e){
			throw e;
		}finally {

		}
	}

	private JSONObject insertMiscMaster(HttpServletRequest request, HttpServletResponse response,
			JSONObject outJsonObject, JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		MiscMasterBLL									miscMasterBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;

		try{

			valueObjectToBLL	= new ValueObject();

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put(AccountGroup.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valueObjectToBLL.put("Name", getJsonObject.get("Name") + "");

			miscMasterBll			= new MiscMasterBLL();

			valueObjectFromBLL	= miscMasterBll.insertMiscMaster(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}

			if(Utility.getLong(valueObjectFromBLL.get("flag")) > 0) {
				outJsonObject.put("Success", "Success");
			}

			outJsonObject.put("executive",new JSONObject(executive));

			return 	outJsonObject;
		}catch(Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		}finally {

		}
	}
}
