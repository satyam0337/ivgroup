package com.ivcargo.actions;

import javax.servlet.http.HttpServletRequest;

import com.iv.logsapp.LogWriter;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;

public class ConfigParamAction {

	private static final String TRACE_ID = "ConfigParamAction";
	
	public static boolean isDestBranchSelectionForDDM(HttpServletRequest request,CacheManip cache,Executive executive) throws Exception {
		
		short 			configValue 	= 0;
		boolean			isAllow			= false;
		
		try {

			configValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DESTINATION_BRANCH_SELECTION_AT_DDM_CREATION);
			
			if(configValue == ConfigParam.CONFIG_KEY_DESTINATION_BRANCH_SELECTION_AT_DDM_CREATION_ALLOWED)
				isAllow = true;
			
			return isAllow;
			
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error : "+e);
			throw e;
		}
	}

	public static boolean isPendingDelStockTblEntryAllow(HttpServletRequest request,CacheManip cache,Executive executive) throws Exception {
		
		short 			configValue 	= 0;
		boolean			isAllow			= false;
		
		try {
			
			configValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY);
			
			if(configValue == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED)
				isAllow = true;
			
			return isAllow;
			
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error : "+e);
			throw e;
		}
	}

	public static boolean isServiceTaxReportAllow(HttpServletRequest request,CacheManip cache,Executive executive) throws Exception {
		
		short 			configValue 	= 0;
		boolean			isAllow			= false;
		
		try {
			
			configValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT);
			
			if(configValue == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED)
				isAllow = true;
			
			return isAllow;
			
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error : "+e);
			throw e;
		}
	}
}