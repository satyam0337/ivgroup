package com.ivcargo.actors;

import com.iv.dto.photoandsignatureservice.Service;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.services.DepositUtility;
import com.ivcargo.utils.services.GenerateCashReceiptServiceInfoUtility;
import com.ivcargo.utils.services.ServiceMessageUtility;
import com.ivcargo.utils.services.ServiceModuleActionRateUtility;
import com.ivcargo.utils.services.ServicePermissionUtility;
import com.ivcargo.utils.services.SignatureTransactionUtility;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;

public class SignatureServiceActor {

	private static final String TRACE_ID = SignatureServiceActor.class.getName();

	public static final String	METHOD_NAME_PROCESS_SIGNATURE_SERVICE		= "processSignatureService";

	public static String getFullClassName() throws Exception {
		return SignatureServiceActor.class.getCanonicalName();
	}

	public void processSignatureService(ValueObject valObjIn) throws Exception {

		ValueObject			checkPermission						= null;
		ValueObject			checkDeposit						= null;
		ValueObject			getRate								= null;
		ValueObject			generateCashReceiptServiceInfo		= null;
		ValueObject			saveSignature						= null;
		ValueObject			updateDeposit						= null;
		long				depositId							= 0;
		double				depositAmount						= 0;
		double				rate								= 0;
		Executive			executive							= null;

		try {

			if (valObjIn.getString("signature", null) == null || valObjIn.getString("signature") == "") {
				return;
			}
			
			executive			= (Executive) valObjIn.get("executive");

			valObjIn.put("serviceId", Service.SIGNATURE_TRANSACTION);
			valObjIn.put("executiveId", executive.getExecutiveId());
			valObjIn.put("branchId", executive.getBranchId());
			valObjIn.put("accountGroupId", executive.getAccountGroupId());
			valObjIn.put("userId", executive.getAccountGroupId()); // can be change in future

			//service permission
			checkPermission		= ServicePermissionUtility.getServicePermission(valObjIn);

			if(checkPermission == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Permission for signature not present for "+valObjIn.getHtData());
				return;
			} 
			if (valObjIn.getBoolean(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT)) {
				//for deposit
				checkDeposit	= DepositUtility.getDeposit(valObjIn);

				if(checkDeposit == null) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit Amount not found for "+valObjIn.getHtData());
					return;
				}

				depositId		= checkDeposit.getLong("depositId", 0);
				depositAmount	= checkDeposit.getDouble("depositAmount", 0d);

				if (depositAmount < 0) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit Amount is less than 0 for "+valObjIn.getHtData());
					return;
				}

				//servicemoduleActionRate
				getRate		= ServiceModuleActionRateUtility.getServiceRate(valObjIn);

				if(getRate == null) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Rate Not found for "+valObjIn.getHtData());
					return;
				}

				rate	= getRate.getDouble("serviceModuleActionRateRate", 0d);

				if((depositAmount - rate) < 0 ) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Rate Not found for "+valObjIn.getHtData());
					return;
				}
			}

			//SignatureTransaction
			saveSignature				= SignatureTransactionUtility.saveSignature(valObjIn);

			if(saveSignature == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Signature not saved for "+valObjIn.getHtData());
				return;
			}

			valObjIn.put("serviceTransactionId", saveSignature.getLong("signatureTransactionId"));
			valObjIn.put("serviceModuleActionRateRate", rate);
			valObjIn.put("moduleTransactionId", valObjIn.getLong("crId"));

			//generate cash receipt
			generateCashReceiptServiceInfo	= GenerateCashReceiptServiceInfoUtility.insertGenerateCRInfoData(valObjIn);

			if(generateCashReceiptServiceInfo == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "CR INfo data not inserted "+valObjIn.getHtData());
				return;
			}

			valObjIn.put("depositId", depositId);
			valObjIn.put("amount", rate);
			if (valObjIn.getBoolean(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT)) {
				//Deposit
				updateDeposit	= DepositUtility.updateDeposit(valObjIn);

				if (updateDeposit == null) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit not update in signature for "+valObjIn.getHtData());
					return;
				}
			}
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Data Successfully Updated !");
		} catch (Exception e) {
			ServiceMessageUtility.executeServiceMessageProcess(valObjIn);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			checkPermission						= null;
			checkDeposit						= null;
			getRate								= null;
			generateCashReceiptServiceInfo		= null;
			saveSignature						= null;
			updateDeposit						= null;
			depositId							= 0;
			depositAmount						= 0;
			rate								= 0;
			executive							= null;
		}
	}
}
