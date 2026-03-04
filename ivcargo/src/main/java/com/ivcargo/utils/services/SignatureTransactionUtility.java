package com.ivcargo.utils.services;

import java.net.URLEncoder;

import org.json.JSONObject;

import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class SignatureTransactionUtility {

	private static final String TRACE_ID = SignatureTransactionUtility.class.getName();

	public static ValueObject saveSignature(ValueObject valObjIn) throws Exception {

		JSONObject		signatureTransactionWbResult		= null;
		ValueObject		saveSignature						= null;

		try {

			//PhotoTransaction
			String signature = valObjIn.getString("signature");

			StringBuffer sign = new StringBuffer();
			sign.append("&signature="+URLEncoder.encode(signature, "UTF-8"));
			sign.append("&userId="+valObjIn.getLong("userId", 0));

			saveSignature 					= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.SAVE_SIGNATURE), sign.toString());
			signatureTransactionWbResult 	= new JSONObject(saveSignature.get(WSConstant.WEB_SERVICE_RESULT).toString());
			saveSignature 					= JsonUtility.convertJsonObjectsToValueObject(signatureTransactionWbResult);

			if(saveSignature == null) {
				return null;
			}

			return saveSignature;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			signatureTransactionWbResult		= null;
			saveSignature						= null;
		}
	}
}
