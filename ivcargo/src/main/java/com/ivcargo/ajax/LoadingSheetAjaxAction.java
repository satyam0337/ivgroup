/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.module.dispatch.LoadingSheetBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.PendingDispatchStock;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary 28-07-2016
 *
 */
public class LoadingSheetAjaxAction implements Action {

	public static final String TRACE_ID = LoadingSheetAjaxAction.class.getName();

	@Override
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

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1: {
				out.println(loadLSConfig(request, jsonObjectOut));
				break;
			}
			case 2: {
				out.println(getPartialDispatchDetails(request, jsonObjectOut, jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
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

	private JSONObject loadLSConfig(HttpServletRequest request, JSONObject jsonObjectOut) throws Exception {
		Executive					executive						= null;
		CacheManip					cacheManip						= null;
		ValueObject					valObjOut						= null;
		ValueObject					configuration					= null;

		try {

			cacheManip			= new CacheManip(request);

			executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			configuration		= cacheManip.getLsConfiguration(request, executive.getAccountGroupId());

			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			valObjOut.put("configuration", configuration);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			valObjOut				= null;
			configuration			= null;
		}
	}

	private JSONObject getPartialDispatchDetails(HttpServletRequest request, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		ValueObject					valObjOut				= null;
		ValueObject					valObjIn				= null;
		LoadingSheetBLL				loadingSheetBLL			= null;
		ValueObject					valueObject				= null;
		CacheManip					cacheManip				= null;
		Executive					executive				= null;

		try {

			loadingSheetBLL			= new LoadingSheetBLL();
			cacheManip				= new CacheManip(request);

			executive				= cacheManip.getExecutive(request);

			valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final Map<Object, Object>	lrViewConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branches", cacheManip.getGenericBranchesDetail(request));
			valObjIn.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, lrViewConfiguration);

			valueObject			= loadingSheetBLL.getPartialDispatchDetailsByWayBillId(valObjIn);

			valObjOut.put(PropertyConfigValueBLLImpl.CONFIGURATION, valueObject.get(PropertyConfigValueBLLImpl.CONFIGURATION));

			if(valueObject.get(DispatchSummary.DISPATCH_SUMMARY_ARRAY) != null)
				valObjOut.put(DispatchSummary.DISPATCH_SUMMARY_ARRAY, valueObject.get(DispatchSummary.DISPATCH_SUMMARY_ARRAY));

			if(valueObject.get(PendingDispatchStock.PENDING_DISPATCH_STOCK_ARRAY) != null)
				valObjOut.put(PendingDispatchStock.PENDING_DISPATCH_STOCK_ARRAY, valueObject.get(PendingDispatchStock.PENDING_DISPATCH_STOCK_ARRAY));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw e;
		} finally {
			valObjOut				= null;
			valObjIn				= null;
			loadingSheetBLL			= null;
			valueObject				= null;
			cacheManip				= null;
		}
	}
}
