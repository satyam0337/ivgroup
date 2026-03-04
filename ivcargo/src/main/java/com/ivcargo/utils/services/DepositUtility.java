package com.ivcargo.utils.services;

import org.json.JSONObject;

import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class DepositUtility {

	private static final String TRACE_ID = DepositUtility.class.getName();

	public static ValueObject getDeposit(ValueObject valObjIn) throws Exception {

		JSONObject		depositWbResult		= null;
		ValueObject		deopsitObj			= null;

		try {

			//deposit
			StringBuffer accountGroupId	= new StringBuffer();
			accountGroupId.append("&accountGroupId="+valObjIn.getLong("accountGroupId", 0)); 

			deopsitObj = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.CHECKING_DEPOSIT_USING_ACCOUNTGROUPID), accountGroupId.toString());
			if(deopsitObj.get(WSConstant.WEB_SERVICE_RESULT) == null){
				return null;
			}
			depositWbResult = new JSONObject(deopsitObj.get(WSConstant.WEB_SERVICE_RESULT).toString());
			deopsitObj = JsonUtility.convertJsonObjectsToValueObject(depositWbResult);

			if(deopsitObj == null || MessageUtility.isMessage(deopsitObj)) {
				return null;
			}

			return deopsitObj;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			depositWbResult		= null;
			deopsitObj			= null;
		}
	}
	
	public static ValueObject updateDeposit(ValueObject valObjIn) throws Exception {

		JSONObject		updateDepositWbResult		= null;
		ValueObject		depositObj					= null;

		try {

			//generate cash receipt
			StringBuffer depositStr	= new StringBuffer();

			depositStr.append("&depositId="+valObjIn.getLong("depositId"));  
			depositStr.append("&amount="+valObjIn.getDouble("amount"));
			depositStr.append("&executiveId="+valObjIn.getLong("executiveId", 0));

			depositObj = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.UPDATE_DEPOSIT_AMOUNT_WITH_DEDUCTION), depositStr.toString());
			updateDepositWbResult = new JSONObject(depositObj.get(WSConstant.WEB_SERVICE_RESULT).toString());

			depositObj = JsonUtility.convertJsonObjectsToValueObject(updateDepositWbResult);

			if(depositObj == null) {
				return null;
			}

			return depositObj;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			updateDepositWbResult	= null;
			depositObj				= null;
		}
	}
}
