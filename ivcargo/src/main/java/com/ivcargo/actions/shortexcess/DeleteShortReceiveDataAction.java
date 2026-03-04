/**
 * 
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary
 *
 */
public class DeleteShortReceiveDataAction implements Action {

	private static final String TRACE_ID	= "DeleteExcessReceiveDataAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 	= null;
		PrintWriter			out 			= null;
		JSONObject 			getJsonObject 	= null;
		JSONObject 			outJsonObject	= null;
		ValueObject			valueObjectIn	= null;
		ShortReceiveBLL		shReceiveBLL	= null;
		boolean 			isSuccess		= false;
		Executive			executive		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			valueObjectIn	= new ValueObject();
			outJsonObject	= new JSONObject();
			shReceiveBLL	= new ShortReceiveBLL();

			executive		= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out	= response.getWriter();

			getJsonObject	= new JSONObject(request.getParameter("json"));

			valueObjectIn.put("shortNumber", Utility.getLong(getJsonObject.get("ShortNumber")));
			valueObjectIn.put("cancelByBranch", executive.getBranchId());
			valueObjectIn.put("cancelByExecutive", executive.getExecutiveId());

			isSuccess	= shReceiveBLL.deleteShortReceiveData(valueObjectIn);

			if(isSuccess) {
				outJsonObject.put("isSuccess", isSuccess);
				outJsonObject.put("shortNumber", Utility.getLong(getJsonObject.get("ShortNumber")));
			}

			out.println(outJsonObject);

		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID,CargoErrorList.SYSTEM_ERROR , new Exception());
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
			valueObjectIn	= null;
		}
	}

}
