/**
 * 
 */
package com.ivcargo.ajax.autocomplete;

import java.io.PrintWriter;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Administrator
 *
 */
public class BranchAutocompleteForAccountGroupAjaxAction implements Action {

	private static final String TRACE_ID = BranchAutocompleteForAccountGroupAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter		out				= null;
		JSONObject		jsonObjectOut	= null;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out				= response.getWriter();

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(branchAutocompleteByAccountGroup(request, response));
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
			out							= null;
			jsonObjectOut				= null;
		}
	}

	private JSONArray branchAutocompleteByAccountGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Executive						executive			= null;
		JSONObject						jObject				= null;
		JSONArray						jArray				= null;
		String							strQry				= null;
		CacheManip						cache				= null;
		LinkedHashMap<Long, String> 	branchDetailsHM		= null;

		try {
			executive			= (Executive) request.getSession().getAttribute("executive");
			cache				= new CacheManip(request);
			response.setContentType("application/json"); // Setting response for JSON Content

			jArray				= new JSONArray();

			if(executive != null) {
				if(request.getParameter("term") != null) {
					strQry 	= request.getParameter("term");

					branchDetailsHM		= cache.getBranchesListByAccountGroupId(request, executive, strQry);

					if(branchDetailsHM != null ){
						for (Long key : branchDetailsHM.keySet()) {
							jObject	= new JSONObject();
							jObject.put("label", branchDetailsHM.get(key));
							jObject.put("id", key);
							jArray.put(jObject);
						}
					}
				}
			} else {
				jObject	= new JSONObject();
				jObject.put("label", "You are logged out, Please login again !");
				jObject.put("id", "0");
				jArray.put(jObject);
			}

			if(jArray.length() < 1) {
				jArray.put(setAutocompleteResponse(request));
			}

			return jArray;
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION : " +e);
			jObject		= new JSONObject();
			jObject.put("label", "Some Error occoured While Fetching !");
			jObject.put("id", "0");
			jArray.put(jObject);
			return jArray;
		} finally {
			executive			= null;
			jObject				= null;
			jArray				= null;
			strQry				= null;
			cache				= null;
			branchDetailsHM		= null;
		}
	}
	
	private JSONObject setAutocompleteResponse(HttpServletRequest request) throws Exception {

		JSONObject	jObject		= null;

		try {

			jObject	= new JSONObject();

			jObject.put("id", "0");

			if(request.getParameter("responseFilter") != null) {
				short resType = Short.parseShort(request.getParameter("responseFilter"));

				switch (resType) {
				case 1:
					jObject.put("label", "No Record Found");
					break;

				case 2:
					jObject.put("label", request.getParameter("term") + " (New)");
					break;
				default:
					jObject.put("label", "No Record Found");
					break;
				}
			}

			return jObject;

		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION : " +e);
			jObject	= new JSONObject();
			jObject.put("label","Some Error occoured While Fetching.");
			jObject.put("id","0");
			return jObject;
		} finally {
			jObject		= null;
		}
	}
}
