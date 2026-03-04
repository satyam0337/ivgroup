/**
 *
 */
package com.ivcargo.ajax.lrview.rate;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import com.businesslogic.master.ratemaster.ArticleWiseWeightDifferenceBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroup;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	11-08-2016
 *
 */
public class GetAllArticleWiseWeightDifferenceDetailsAjaxAction implements Action {

	private static final String TRACE_ID = GetAllArticleWiseWeightDifferenceDetailsAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(getAllArticleWiseWeightDifferenceDetailsOnBooking(request, response, jsonObjectOut, jsonObjectIn));
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			jsonObjectOut			= new JSONObject();
			try {
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final JSONException e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
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

	private JSONObject getAllArticleWiseWeightDifferenceDetailsOnBooking(HttpServletRequest request, HttpServletResponse response, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		Executive						executive						= null;
		ValueObject						valObjIn						= null;
		ValueObject						valObjOut						= null;
		ArticleWiseWeightDifferenceBLL	articleWiseWeightDifferenceBLL	= null;

		try {
			articleWiseWeightDifferenceBLL	= new ArticleWiseWeightDifferenceBLL();
			valObjIn						= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut						= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			executive						= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			valObjIn.put(ECargoConstantFile.EXECUTIVE, executive);
			valObjIn.put(AliasNameConstants.BRANCH_ID, Long.parseLong(jsonObjectIn.get("srcBranchId").toString()));
			valObjIn.put(AccountGroup.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valObjIn.put(Constant.DESTINATION_BRANCH_ID, Long.parseLong(jsonObjectIn.get(Constant.DESTINATION_BRANCH_ID).toString()));

			valObjOut						= articleWiseWeightDifferenceBLL.getAllArticleWiseWeightDifferenceDetailsOnBooking(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			valObjIn						= null;
			valObjOut						= null;
			articleWiseWeightDifferenceBLL	= null;
			executive						= null;
		}
	}
}