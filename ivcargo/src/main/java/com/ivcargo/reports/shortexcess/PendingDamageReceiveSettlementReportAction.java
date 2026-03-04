/**
 *
 */
package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.DamageReceiveSettlementBLL;
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
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	20-01-2016
 *
 */
public class PendingDamageReceiveSettlementReportAction implements Action {

	public static final String TRACE_ID = "PendingDamageReceiveSettlementReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		PrintWriter 					out							= null;
		JSONObject						jsonObjectOut				= null;
		JSONObject						getJsonObject				= null;
		ValueObject						valueObjectOut				= null;
		ValueObject						valueObjectIn				= null;
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

			final var	cacheManip	= new CacheManip(request);
			final var	executive	= cacheManip.getExecutive(request);
			getJsonObject 			= new JSONObject(request.getParameter("json"));
			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut			= new ValueObject();
			final var	dmReceiveSettlementBLL	= new DamageReceiveSettlementBLL();

			if(request.getParameter("filter") != null)
				filter		= Utility.getShort(request.getParameter("filter"));

			valueObjectIn.put("filter", filter);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			var	reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			final var	jsobj	= dmReceiveSettlementBLL.getAllPendingDamageSettlementData(valueObjectIn, valueObjectOut);

			if(filter == (short) 1)
				configuration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_DAMAGE_RECEIVE_SETTLEMENT_REPORT, executive.getAccountGroupId());
			else
				configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_DAMAGE_REGISTER_SETTLEMENT);

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
