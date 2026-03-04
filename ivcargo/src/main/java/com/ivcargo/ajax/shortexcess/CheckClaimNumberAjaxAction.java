/**
 * 
 */
package com.ivcargo.ajax.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ClaimEntryBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Administrator
 *
 */
public class CheckClaimNumberAjaxAction implements Action {

	private static final String TRACE_ID = CheckClaimNumberAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		PrintWriter						out					= null;
		JSONObject						jsonObjectIn		= null;
		JSONObject						jsonObjectOut		= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}
			
			out.println(checkClaimNumberInShortModule(request, response, jsonObjectIn));
		} catch (Exception _e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
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

	private JSONObject checkClaimNumberInShortModule(HttpServletRequest request, HttpServletResponse response, JSONObject jsonObjectIn) throws Exception {
		Executive								executive							= null;
		ValueObject								jsobj								= null;
		ValueObject								valObjIn							= null;
		ClaimEntryBLL							claimEntryBLL						= null;
		JSONObject 								object 								= null;
		
		try {
			executive		    = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			claimEntryBLL		= new ClaimEntryBLL();
			
			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			jsobj = claimEntryBLL.checkClaimNumberForSettlement(valObjIn);

			object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			return object;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive							= null;
			jsobj								= null;
			valObjIn							= null;
		}
	}
}
