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
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.JsonUtility;
import com.platform.resource.CargoErrorList;

/**
 * @author Owner
 *
 */
public class UpdateShortReceiveDataAction implements Action {

	public static final String TRACE_ID = "UpdateShortReceiveDataAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 				= null;
		PrintWriter					out					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	outJsonObject	= new JSONObject();
			final var	shortReceiveBLL	= new ShortReceiveBLL();

			response.setContentType("application/json");

			out 	= response.getWriter();

			final var	getJsonObject	= new JSONObject(request.getParameter("json"));
			final var	valueObjectIn	= JsonUtility.convertJsontoValueObject(getJsonObject);

			final var	isSuccess		= shortReceiveBLL.updateShortReceiveData(valueObjectIn);

			if(!isSuccess) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				out.println(outJsonObject);
				return;
			}

			outJsonObject.put("isSuccess", isSuccess);

			out.println(outJsonObject);
		} catch (final Exception e) {
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}
}
