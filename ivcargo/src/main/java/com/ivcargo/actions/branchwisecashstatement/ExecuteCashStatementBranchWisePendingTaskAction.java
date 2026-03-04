package com.ivcargo.actions.branchwisecashstatement;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.ivcore.ExecutePendingTaskForBranchBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class ExecuteCashStatementBranchWisePendingTaskAction implements Action {

	public static final String TRACE_ID = ExecuteCashStatementBranchWisePendingTaskAction.class.getName();

	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		JSONObject							jsonObjectIn						= null;
		JSONObject							jsonObjectOut						= null;
		PrintWriter							out									= null;
		ValueObject							valObjIn							= null;
		Executive							executive							= null;
		CacheManip  						cache								= null;
		ExecutePendingTaskForBranchBll		executePendingTaskForBranchBll  	= null;
		HashMap<Long, ArrayList<Long>>  	accountGroupTieUpConfigurationHM 	= null;
		PropertyConfigValueBLLImpl			propertyConfigValueBLLImpl			= null;
		ValueObject							cashStatementConfig					= null;
		ValueObject							generalConfiguration				= null;
		ValueObject							valueInObject						= null;
		var								branchId 							= 0L;

		try {

			response.setContentType("application/json");
			out									= response.getWriter();
			jsonObjectOut						= new JSONObject();

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}
			jsonObjectIn						= new JSONObject(request.getParameter("json"));

			valObjIn			    			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			cache 	   							= new CacheManip(request);
			executive							= (Executive) request.getSession().getAttribute("executive");
			branchId 							= Long.parseLong(valObjIn.get("branchId").toString());
			executePendingTaskForBranchBll 		= new ExecutePendingTaskForBranchBll();
			propertyConfigValueBLLImpl			= new PropertyConfigValueBLLImpl();
			valueInObject						= new ValueObject();
			cashStatementConfig					= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.CASH_STATEMENT_REPORT);
			generalConfiguration				= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			accountGroupTieUpConfigurationHM	= cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId());

			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cashStatementConfig);
			if(accountGroupTieUpConfigurationHM != null)
				valueInObject.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, accountGroupTieUpConfigurationHM);
			valueInObject.put(GeneralConfiguration.GENERAL_CONFIGURATION, generalConfiguration);
			valueInObject.put("executive", executive);

			executePendingTaskForBranchBll.processPendingData(branchId,executive,valueInObject);
			jsonObjectOut.put("valObjIn", JsonUtility.convertionToJsonObjectForResponse(valObjIn));
			out.println(jsonObjectOut);
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			jsonObjectIn						= null; 
			out									= null; 
			valObjIn							= null; 
			executive							= null; 
			cache								= null; 
			executePendingTaskForBranchBll  	= null; 
			accountGroupTieUpConfigurationHM 	= null; 
			propertyConfigValueBLLImpl			= null; 
			cashStatementConfig					= null; 
			valueInObject						= null; 
		}
	}
}
