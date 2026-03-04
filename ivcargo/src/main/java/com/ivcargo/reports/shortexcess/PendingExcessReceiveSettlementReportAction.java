/**
 *
 */
package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	28-10-2015
 *
 */
public class PendingExcessReceiveSettlementReportAction implements Action {

	public static final String TRACE_ID	= "PendingExcessReceiveSettlementReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter 					out							= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;
		ValueObject						configuration				= null;

		try {
			response.setContentType("application/json");

			out 					= response.getWriter();
			jsonObjectOut			= new JSONObject();

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			final var	cacheManip				= new CacheManip(request);
			final var	executive				= cacheManip.getExecutive(request);
			final var	getJsonObject 			= new JSONObject(request.getParameter("json"));
			final var	valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);
			final var	valueObjectOut			= new ValueObject();
			final var	exSettlementBLL			= new ExcessReceiveSettlementBLL();
			final var	branchValObj 			= cacheManip.getGenericBranchesDetail(request);

			if(request.getParameter("filter") != null)
				filter		= Short.parseShort(request.getParameter("filter"));

			valueObjectIn.put("branchValObj", branchValObj);
			valueObjectIn.put("filter", filter);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			var	reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			final var	jsobj	= exSettlementBLL.getAllPendingExcessSettlementData(valueObjectIn, valueObjectOut);

			if(filter == (short) 1)
				configuration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_EXCESS_RECEIVE_SETTLEMENT_REPORT, executive.getAccountGroupId());
			else
				configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_EXCESS_REGISTER_SETTLEMENT);

			jsobj.put("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			jsobj.put("branchAddress", reportViewModel.getBranchAddress());
			jsobj.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());
			jsobj.put("configuration", configuration);

			final var outJsonObject	= JsonUtility.convertionToJsonObjectForResponse(jsobj);

			out.println(outJsonObject);
		} catch (final Exception e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e1);
				e1.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}

}
