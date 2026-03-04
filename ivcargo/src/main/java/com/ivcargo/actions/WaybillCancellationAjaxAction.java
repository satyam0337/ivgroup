
package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class WaybillCancellationAjaxAction implements Action {

	public static final String TRACE_ID = "WaybillCancellationAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
	
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		
		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject();
			

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}
			
			out.println(initilizeWB(request, response, jsonObjectOut, jsonObjectIn));

		} catch (Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject initilizeWB(HttpServletRequest request,HttpServletResponse response, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		Executive				executive				= null;
		CacheManip				cache					= null;
		ValueObject				valObjIn				= null;
		ValueObject				valObjOut				= null;
		ValueObject				configuration			= null;

		try {

			cache				= new CacheManip(request);
			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			executive			= (Executive) request.getSession().getAttribute("executive");
			configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			
			valObjIn.put("executive", Converter.DtoToHashMap(executive));
			valObjIn.put("configuration", configuration);
			valObjIn.put("configuration", JsonConstant.getExecutive());
			valObjOut.put("configuration", configuration);
			valObjOut.put("executive", Converter.DtoToHashMap(executive));
			valObjOut.put("executiveCon", JsonConstant.getExecutive());
			JSONObject object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);

			return object;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			cache					= null;
			valObjIn				= null;
			valObjOut				= null;
			configuration			= null;
		}
	}
}
