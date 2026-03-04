/**
 *
 */
package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class PendingSourceBranchwiseShortExcessSettlementReportAction implements Action {

	private static final String TRACE_ID = "PendingSourceBranchwiseShortExcessSettlementReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		// TODO Auto-generated method stub
		final HashMap<String,Object>	 						error 							= null;
		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;
		short											selectType						= 0;

		try {

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();

			selectType				= Utility.getShort(getJsonObject.get("SelectType"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}

			switch (selectType) {
			case 1:
				out.println(getShortDetailsSourceBranchwise(request, outJsonObject, getJsonObject));
				break;
			case 2:
				out.println(getExcessDetailsSourceBranchwise(request, outJsonObject, getJsonObject));
				break;
			default:
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				break;
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
			outJsonObject			= null;
		}
	}

	private JSONObject getShortDetailsSourceBranchwise(final HttpServletRequest request, JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectIn					= null;
		ValueObject										valueObjectOut					= null;
		ValueObject										jsobj							= null;
		Executive										executive						= null;
		ShortReceiveSettlementBLL						shReceiveSettlementBLL			= null;
		short											filter							= 0;
		ReportViewModel									reportViewModel					= null;
		CacheManip										cacheManip						= null;
		ValueObject										branchValObj					= null;
		try{

			shReceiveSettlementBLL		= new ShortReceiveSettlementBLL();
			valueObjectOut				= new ValueObject();
			cacheManip					= new CacheManip(request);
			branchValObj 			= cacheManip.getGenericBranchesDetail(request);
			executive				= (Executive) request.getSession().getAttribute("executive");

			if(request.getParameter("filter") != null)
				filter		= Utility.getShort(request.getParameter("filter"));

			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);

			valueObjectIn.put("filter", filter);
			valueObjectIn.put("branchValObj", branchValObj);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("packingTypeForGroup", cacheManip.getPackingTypeMasterData(request));

			jsobj					= shReceiveSettlementBLL.getSourcePendingShortSettlementData(valueObjectIn, valueObjectOut);

			reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			jsobj.put("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			jsobj.put("accountGroupId", executive.getAccountGroupId());
			jsobj.put("branchAddress", reportViewModel.getBranchAddress());
			jsobj.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			throw e;
		}
	}

	private JSONObject getExcessDetailsSourceBranchwise(final HttpServletRequest request, JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject						valueObjectIn					= null;
		ValueObject						valueObjectOut					= null;
		ValueObject						jsobj							= null;
		Executive						executive						= null;
		ReportViewModel					reportViewModel					= null;
		ExcessReceiveSettlementBLL		exSettlementBLL					= null;
		ValueObject						branchValObj					= null;
		CacheManip						cacheManip						= null;
		short							filter							= 0;

		try{

			exSettlementBLL				= new ExcessReceiveSettlementBLL();
			valueObjectOut				= new ValueObject();
			cacheManip					= new CacheManip(request);

			executive				= (Executive) request.getSession().getAttribute("executive");
			branchValObj 			= cacheManip.getGenericBranchesDetail(request);

			valueObjectIn			= JsonUtility.convertJsontoValueObject(getJsonObject);

			if(request.getParameter("filter") != null)
				filter				= Short.parseShort(request.getParameter("filter"));

			valueObjectIn.put("filter", filter);
			valueObjectIn.put("branchValObj", branchValObj);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);

			jsobj					= exSettlementBLL.getSourceBranchPendingExcessSettlementData(valueObjectIn, valueObjectOut);

			reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			if(reportViewModel != null) {
				jsobj.put("accountGroupId", executive.getAccountGroupId());
				jsobj.put("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
				jsobj.put("branchAddress", reportViewModel.getBranchAddress());
				jsobj.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());
			}

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch(final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			throw e;
		}
	}
}
