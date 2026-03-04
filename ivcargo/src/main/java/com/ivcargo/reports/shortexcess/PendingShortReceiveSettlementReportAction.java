/**
 *
 */
package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
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
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	26-10-2015
 *
 */
public class PendingShortReceiveSettlementReportAction implements Action {

	public static final String TRACE_ID = "PendingShortReceiveSettlementReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter 					out							= null;
		JSONObject						jsonObjectOut				= null;
		JSONObject						getJsonObject				= null;
		ValueObject						valueObjectOut				= null;
		ValueObject						jsobj						= null;
		ValueObject						valueObjectIn				= null;
		Executive						executive					= null;
		ShortReceiveSettlementBLL		shReceiveSettlementBLL		= null;
		short							filter						= 0;
		ReportViewModel					reportViewModel				= null;
		ValueObject						branchValObj				= null;
		CacheManip						cacheManip					= null;
		ValueObject						configuration				= null;

		try {
			response.setContentType("application/json");

			out 					= response.getWriter();
			jsonObjectOut			= new JSONObject();
			cacheManip				= new CacheManip(request);

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			executive				= (Executive) request.getSession().getAttribute("executive");
			getJsonObject 			= new JSONObject(request.getParameter("json"));
			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);
			valueObjectOut			= new ValueObject();
			shReceiveSettlementBLL	= new ShortReceiveSettlementBLL();
			branchValObj 			= cacheManip.getGenericBranchesDetail(request);

			if(request.getParameter("filter") != null)
				filter		= Utility.getShort(request.getParameter("filter"));

			valueObjectIn.put("filter", filter);
			valueObjectIn.put("branchValObj", branchValObj);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("packingTypeForGroup", cacheManip.getPackingTypeMasterData(request));

			if(filter == (short) 1)
				configuration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_SHORT_RECEIVE_SETTLEMENT_REPORT, executive.getAccountGroupId());
			else
				configuration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_SHORT_REGISTER_SETTLEMENT);

			jsobj	= shReceiveSettlementBLL.getAllPendingShortSettlementData(valueObjectIn, valueObjectOut);

			reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			jsobj.put("configuration", configuration);
			jsobj.put("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			jsobj.put("branchAddress", reportViewModel.getBranchAddress());
			jsobj.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());

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
			out							= null;
			getJsonObject 				= null;
			executive					= null;
			shReceiveSettlementBLL		= null;
		}
	}
}
