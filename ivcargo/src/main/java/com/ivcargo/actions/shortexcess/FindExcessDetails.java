/**
 * 
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class FindExcessDetails implements Action {

	private static final String TRACE_ID = "FindExcessDetails";

	@SuppressWarnings({ "unchecked" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	 						error 							= null;
		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;
		ValueObject										valueObjectFromBLL				= null;
		ValueObject										valueObjectToBLL				= null;
		ExcessReceiveSettlementBLL						excessReceiveBLL				= null;
		long											WayBillId						= 0;
		ArrayList<ExcessReceive> 						exessDetailsList				= null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun						= null;
		Executive										executive						= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive		= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();
			valueObjectToBLL	= new ValueObject();
			commonFun			= new CommonFuctionToConvertArrayListToJSONArray();

			if(getJsonObject.get("WayBillId") != null) {
				WayBillId 	= Utility.getLong(getJsonObject.get("WayBillId"));
			}

			valueObjectToBLL.put("wayBillId", WayBillId);
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			excessReceiveBLL	= new ExcessReceiveSettlementBLL();

			valueObjectFromBLL	= excessReceiveBLL.getExcessDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				out.println(outJsonObject);
				return;
			}

			exessDetailsList	= (ArrayList<ExcessReceive>) valueObjectFromBLL.get("newPendingExSettlementList");
			if(exessDetailsList != null && exessDetailsList.size() > 0) {
				outJsonObject.put("exessDetailsCall", commonFun.getExcessReceiveJSONArrayObject(exessDetailsList));
			}


			out.println(outJsonObject);
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
			outJsonObject			= null;
			valueObjectFromBLL		= null;
			excessReceiveBLL		= null;
			exessDetailsList		= null;
			commonFun				= null;
		}
	}
}
