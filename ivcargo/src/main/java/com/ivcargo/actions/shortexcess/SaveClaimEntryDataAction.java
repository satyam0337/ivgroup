/**
 * 
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ClaimEntryBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	14-10-2015
 *
 */
public class SaveClaimEntryDataAction implements Action {

	public static final String TRACE_ID	=	"SaveClaimEntryDataAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 					error 							= null;
		PrintWriter		out 			= null;
		JSONObject 		getJsonObject 	= null;
		JSONObject 		outJsonObject	= null;
		Executive 		executive 		= null;
		ValueObject		valueObjectIn	= null;
		ClaimEntryBLL	claimEntryBLL	= null;
		long			claimEntryId	= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			valueObjectIn	= new ValueObject();
			claimEntryBLL	= new ClaimEntryBLL();
			outJsonObject	= new JSONObject();

			executive	= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out	= response.getWriter();

			getJsonObject	= new JSONObject(request.getParameter("json"));

			valueObjectIn.put("lrNumber", (String) getJsonObject.get("LRNumber"));
			valueObjectIn.put("wayBillId", Utility.getLong(getJsonObject.get("WayBillId")));
			valueObjectIn.put("partyId", Utility.getLong(getJsonObject.get("PartyId")));
			valueObjectIn.put("lounchBy", (String) getJsonObject.get("LounchBy"));
			valueObjectIn.put("claimAmount", Utility.getDouble(getJsonObject.get("ClaimAmount")));
			valueObjectIn.put("claimPerson", (String) getJsonObject.get("ClaimPerson"));
			valueObjectIn.put("remark", (String) getJsonObject.get("Remark"));
			valueObjectIn.put("claimType", Utility.getShort(getJsonObject.get("ClaimType")));

			valueObjectIn.put("branchId", executive.getBranchId());
			valueObjectIn.put("executiveId", executive.getExecutiveId());
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());

			claimEntryId	= claimEntryBLL.saveClaimEntryData(valueObjectIn);

			if(claimEntryId <= 0) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				out.println(outJsonObject);
				return;
			}

			outJsonObject.put("claimEntryId", claimEntryId);
			outJsonObject.put("wayBillNumber", (String) getJsonObject.get("LRNumber"));

			out.println(outJsonObject);

		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			out.flush();
			out.close();
			out 			= null;
			getJsonObject 	= null;
			outJsonObject	= null;
			executive 		= null;
			valueObjectIn	= null;
			claimEntryBLL	= null;
		}
	}
}
