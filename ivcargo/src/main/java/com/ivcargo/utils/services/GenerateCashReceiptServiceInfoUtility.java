package com.ivcargo.utils.services;

import java.net.URLEncoder;

import org.json.JSONObject;

import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.photoandsignatureservice.Application;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class GenerateCashReceiptServiceInfoUtility {

	private static final String TRACE_ID = GenerateCashReceiptServiceInfoUtility.class.getName();

	public static ValueObject insertGenerateCRInfoData(ValueObject valObjIn) throws Exception {

		JSONObject		generateCashReceiptServiceInfoWbResult		= null;
		ValueObject		generateCashReceiptServiceInfo				= null;

		try {

			//generate cash receipt
			StringBuffer cashreceipt	= new StringBuffer();

			cashreceipt.append("&serviceTransactionId="+valObjIn.getLong("serviceTransactionId"));  
			cashreceipt.append("&moduleTransactionId="+valObjIn.getLong("moduleTransactionId"));
			cashreceipt.append("&transactionRate="+valObjIn.getDouble("serviceModuleActionRateRate", 0));
			cashreceipt.append("&serviceId="+valObjIn.getLong("serviceId", 0));
			cashreceipt.append("&applicationId="+Application.IV_CARGO);
			cashreceipt.append("&moduleId="+ModuleIdentifierConstant.GENERATE_CR);
			cashreceipt.append("&executiveId="+valObjIn.getLong("executiveId", 0));
			cashreceipt.append("&branchId="+valObjIn.getLong("branchId", 0));
			cashreceipt.append("&accountGroupId="+valObjIn.getLong("accountGroupId", 0));
			cashreceipt.append("&transactionDateTime="+URLEncoder.encode(DateTimeUtility.getCurrentTimeStamp().toString(), "UTF-8"));

			generateCashReceiptServiceInfo = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.SAVE_GENERATE_CASH_RECEIPT_SERVICE_INFO), cashreceipt.toString());
			if(generateCashReceiptServiceInfo.get(WSConstant.WEB_SERVICE_RESULT) == null){
				return null;
			}
			generateCashReceiptServiceInfoWbResult = new JSONObject(generateCashReceiptServiceInfo.get(WSConstant.WEB_SERVICE_RESULT).toString());

			generateCashReceiptServiceInfo = JsonUtility.convertJsonObjectsToValueObject(generateCashReceiptServiceInfoWbResult);

			if(generateCashReceiptServiceInfo == null) {
				return null;
			}

			return generateCashReceiptServiceInfo;
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			generateCashReceiptServiceInfoWbResult		= null;
			generateCashReceiptServiceInfo				= null;
		}
	}
}