package com.ivcargo.actors;

import com.iv.dto.photoandsignatureservice.Service;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.iv.utils.message.MessageUtility;
import com.ivcargo.utils.services.DepositUtility;
import com.ivcargo.utils.services.GenerateCashReceiptServiceInfoUtility;
import com.ivcargo.utils.services.PhotoTransactionUtility;
import com.ivcargo.utils.services.ServiceMessageUtility;
import com.ivcargo.utils.services.ServiceModuleActionRateUtility;
import com.ivcargo.utils.services.ServicePermissionUtility;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;

public class PhotoServiceActor {

	private static final String TRACE_ID = PhotoServiceActor.class.getName();

	public static final String	METHOD_NAME_PROCESS_PHOTO_SERVICE		= "processPhotoService";

	public static String getFullClassName() {
		return PhotoServiceActor.class.getCanonicalName();
	}

	public void processPhotoService(ValueObject valObjIn) throws Exception {

		ValueObject			checkPermission						= null;
		ValueObject			checkDeposit						= null;
		ValueObject			getRate								= null;
		ValueObject			generateCashReceiptServiceInfo		= null;
		ValueObject			savePhoto							= null;
		ValueObject			updateDeposit						= null;
		long				depositId							= 0;
		double				depositAmount						= 0;
		double				rate								= 0;
		Executive			executive							= null;
		ValueObject			message								= null;

		try {
			if (valObjIn.getString("image", null) == null || "".equals(valObjIn.getString("image")))
				return;

			executive			= (Executive) valObjIn.get(Executive.EXECUTIVE);

			valObjIn.put("serviceId", Service.PHOTO_TRANSACTION);
			valObjIn.put("executiveId", executive.getExecutiveId());
			valObjIn.put("branchId", executive.getBranchId());
			valObjIn.put("accountGroupId", executive.getAccountGroupId());
			valObjIn.put("userId", executive.getAccountGroupId()); // can be change in future

			//service permission
			checkPermission		= ServicePermissionUtility.getServicePermission(valObjIn);

			if(checkPermission == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Permission not found for " +valObjIn.getHtData());
				return;
			}

			if (valObjIn.getBoolean(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT)) {
				//for deposit
				checkDeposit	= DepositUtility.getDeposit(valObjIn);

				if(checkDeposit == null) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit not found for " +valObjIn.getHtData());
					return;
				}

				depositId		= checkDeposit.getLong("depositId", 0);
				depositAmount	= checkDeposit.getDouble("depositAmount", 0d);

				if (depositAmount < 0) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit Amount is less than 0");
					return;
				}

				//servicemoduleActionRate
				getRate		= ServiceModuleActionRateUtility.getServiceRate(valObjIn);

				if(getRate == null) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Rate not found for "+valObjIn.getHtData());
					return;
				}

				rate	= getRate.getDouble("serviceModuleActionRateRate", 0d);

				if(depositAmount - rate < 0 ) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Deposit Amount minus rate is less then 0 ");
					return;
				}
			}

			//PhotoTransaction
			savePhoto = PhotoTransactionUtility.savePhoto(valObjIn);

			if(savePhoto == null)
				return;

			if(MessageUtility.isError(savePhoto)) {
				message = (ValueObject) savePhoto.get(Message.MESSAGE);

				if(message == null || message.getShort(Message.TYPE) == Message.MESSAGE_TYPE_ERROR) {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Photo not saved as ");
					return;
				}
			}

			valObjIn.put("serviceTransactionId", savePhoto.getLong("photoTransactionId"));
			valObjIn.put("serviceModuleActionRateRate", rate);
			valObjIn.put("moduleTransactionId", valObjIn.getLong("crId"));

			//generate cash receipt
			generateCashReceiptServiceInfo	= GenerateCashReceiptServiceInfoUtility.insertGenerateCRInfoData(valObjIn);

			if(generateCashReceiptServiceInfo == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "Generate CR Service is null for "+valObjIn.getHtData());
				return;
			}

			valObjIn.put("depositId", depositId);
			valObjIn.put("amount", rate);

			if (valObjIn.getBoolean(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT)) {
				//Deposit
				updateDeposit	= DepositUtility.updateDeposit(valObjIn);

				if (updateDeposit == null)
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "update Deposit is null for "+valObjIn.getHtData());
			}
		} catch (final Exception e) {
			ServiceMessageUtility.executeServiceMessageProcess(valObjIn);
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			checkPermission						= null;
			checkDeposit						= null;
			getRate								= null;
			generateCashReceiptServiceInfo		= null;
			savePhoto							= null;
			updateDeposit						= null;
			executive							= null;
		}
	}

	public ValueObject getPhotoDetail(ValueObject bookingTimePhotoServiceInfo) throws Exception {
		ValueObject			valueObject							= null;

		try {
			valueObject = new ValueObject();
			valueObject.put("serviceTransactionId", 1);
			valueObject.put("moduleId", bookingTimePhotoServiceInfo.get("moduleId"));
			valueObject.put("waybillId", bookingTimePhotoServiceInfo.get("waybillId"));

			return PhotoTransactionUtility.getPhoto(valueObject);
		} catch (final Exception e) {
			ServiceMessageUtility.executeServiceMessageProcess(valueObject);
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			valueObject = null;
		}
	}
}
