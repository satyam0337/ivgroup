package com.ivcargo.utils.services;

import org.json.JSONObject;

import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.photoandsignatureservice.Application;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class ServiceModuleActionRateUtility {

	private static final String TRACE_ID = ServiceModuleActionRateUtility.class.getName();

	public static ValueObject getServiceRate(ValueObject valObjIn) throws Exception {

		JSONObject		serviceModuleActionRateWbResult		= null;
		ValueObject		rateObj								= null;

		try {

			//ServiceModuleActionRate	
			StringBuffer module	= new StringBuffer();

			module.append("&accountGroupId="+valObjIn.getLong("accountGroupId", 0));
			module.append("&branchId="+valObjIn.getLong("branchId", 0));
			module.append("&serviceId="+valObjIn.getLong("serviceId"));
			module.append("&moduleId="+ModuleIdentifierConstant.GENERATE_CR);
			module.append("&applicationId="+Application.IV_CARGO);

			rateObj = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.GET_RATE), module.toString());
			serviceModuleActionRateWbResult = new JSONObject(rateObj.get(WSConstant.WEB_SERVICE_RESULT).toString());
			rateObj = JsonUtility.convertJsonObjectsToValueObject(serviceModuleActionRateWbResult);

			if(rateObj == null || MessageUtility.isMessage(rateObj)) {
				return null;
			}

			return rateObj;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			serviceModuleActionRateWbResult		= null;
			rateObj			= null;
		}
	}
}
