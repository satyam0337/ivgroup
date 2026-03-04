/**
 * 
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class FindShortDetails implements Action {

	private static final String TRACE_ID = "FindShortDetails";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		JSONObject							jsonObjectOut		= null;
		PrintWriter							out					= null;
		JSONObject							getJsonObject		= null;
		ValueObject							jsobj				= null;
		ValueObject							valueObjectIn		= null;
		ValueObject							valueObjectOut		= null;
		ShortReceiveSettlementBLL			shortReceiveBLL		= null;
		Executive							executive			= null;

		try {
			
			response.setContentType("application/json");
			
			out 					= response.getWriter();
			jsonObjectOut			= new JSONObject();
			
			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}
			
			executive		= (Executive) request.getSession().getAttribute("executive");

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			valueObjectIn		= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut		= new ValueObject();

			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			shortReceiveBLL	= new ShortReceiveSettlementBLL();

			jsobj			= shortReceiveBLL.getShortDetails(valueObjectIn, valueObjectOut);

			JSONObject outJsonObject	= JsonUtility.convertionToJsonObjectForResponse(jsobj);
			
			out.println(outJsonObject);
		} catch (Exception e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e1);
				e1.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
		}
	}
}
