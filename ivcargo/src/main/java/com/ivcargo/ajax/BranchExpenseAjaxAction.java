package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.print.BranchExpensePrintBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class BranchExpenseAjaxAction  implements Action{
	
	public static final String TRACE_ID = "BranchExpenseAjaxAction";

  
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"inside action "+filter);

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
				case 2: {
					out.println(getDataToExpencePrint(request, response, jsonObjectOut, jsonObjectIn));
					break;
				}
			
				default: {
					jsonObjectOut.put("errorDescription", "Unknown Request");
					out.println(jsonObjectOut);
					break;
				}
			}
		} catch (Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
				e.printStackTrace();
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
	
	private JSONObject getDataToExpencePrint(HttpServletRequest request, HttpServletResponse response, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		ValueObject					valObjOut				= null;
		Executive					executive				= null;
		ValueObject					valObjIn				= null;
		BranchExpensePrintBLL		branchExpensePrintBLL	= null;
		ValueObject					allBranches				= null;
		AccountGroup				accountGroup			= null;
		CacheManip					cacheManip				= null;
		Branch						branch					= null;
		ReportViewModel				reportViewModel			= null;
		ReportView					reportView				= null;
		ValueObject					allSubRegions			= null;
		
		try {
			branchExpensePrintBLL		= new BranchExpensePrintBLL();
			cacheManip					= new CacheManip(request);
			reportView					= new ReportView();
			reportViewModel				= new ReportViewModel();
			
			executive			= (Executive) request.getSession().getAttribute("executive");
			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			
			valObjIn.put("executive", executive);
			
			allBranches			= cacheManip.getGenericBranchesDetail(request);
			accountGroup		= cacheManip.getAccountGroupById(request, executive.getAccountGroupId());
			allSubRegions		= cacheManip.getAllSubRegions(request);
			
			branch		= (Branch) allBranches.get(executive.getBranchId() + "");
			
			valObjIn.put("allBranches", allBranches);
			valObjIn.put("accountGroup", accountGroup);
			valObjIn.put("allSubRegions", allSubRegions);
			
			valObjOut			= branchExpensePrintBLL.getBranceExpenseForPrint(valObjIn);
			
			valObjOut.put("executive", Converter.DtoToHashMap(executive));
			valObjOut.put("LoggedInBranchDetails", Converter.DtoToHashMap(branch));
			
			reportViewModel		= reportView.populateReportViewModel(request, reportViewModel);
			
			valObjOut.put("reportViewModel", Converter.DtoToHashMap(reportViewModel));
			
			
			JSONObject object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			
			return object;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			valObjOut				= null;
		}
	}

	
}
