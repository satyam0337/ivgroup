package com.ivcargo.utils.services;

import org.json.JSONObject;

import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class ServiceMessageUtility {

	private static final String TRACE_ID = ServiceMessageUtility.class.getName();

	public static void executeServiceMessageProcess(ValueObject  valObjIn) throws Exception{

		JSONObject		serviceMessageWbResult	= null;

		try {

			StringBuffer message = new StringBuffer();
			message.append("&message="+valObjIn.getHtData().toString());
			message.append("&messageType=1");

			ValueObject throwMessage = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.SERVICE_MESSAGE), message.toString());

			if (throwMessage.get(WSConstant.WEB_SERVICE_RESULT) == null) {
				return;
			}

			serviceMessageWbResult = new JSONObject(throwMessage.get(WSConstant.WEB_SERVICE_RESULT).toString());
			throwMessage = JsonUtility.convertJsonObjectsToValueObject(serviceMessageWbResult);

			if (MessageUtility.isError(throwMessage)) {
				valObjIn.put(Message.MESSAGE, throwMessage.get(Message.MESSAGE));
			}

		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			serviceMessageWbResult	= null;
		}
	}
}

