package com.ivcargo.utils.services;

import java.net.URLEncoder;

import org.json.JSONObject;

import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.MessageList;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class PhotoTransactionUtility {

	private static final String TRACE_ID = PhotoTransactionUtility.class.getName();

	private PhotoTransactionUtility() {

	}

	public static ValueObject savePhoto(ValueObject valObjIn) throws Exception {
		JSONObject		photoTransactionWbResult		= null;
		ValueObject		savePhoto						= null;

		try {
			//PhotoTransaction
			final String photos = valObjIn.getString("image");

			final StringBuilder photo = new StringBuilder();
			photo.append("&image="+URLEncoder.encode(photos, "UTF-8"));
			photo.append("&userId="+valObjIn.getLong("userId", 0));
			photo.append("&moduleId="+1);

			savePhoto = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.SAVE_PHOTO), photo.toString());

			if(savePhoto.get(WSConstant.WEB_SERVICE_RESULT) == null)
				return null;

			photoTransactionWbResult = new JSONObject(savePhoto.get(WSConstant.WEB_SERVICE_RESULT).toString());

			return JsonUtility.convertJsonObjectsToValueObject(photoTransactionWbResult);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			photoTransactionWbResult		= null;
			savePhoto			= null;
		}
	}

	public static ValueObject getPhoto(ValueObject valueObject) throws Exception {
		JSONObject		serviceDataWbResult		= null;
		ValueObject		photoObj				= null;

		try {
			//service permission
			final StringBuilder service = new StringBuilder();
			service.append("&serviceTransactionId="+valueObject.getLong("serviceTransactionId"));
			service.append("&waybillId="+valueObject.getLong("waybillId"));
			service.append("&moduleId="+valueObject.getShort("moduleId"));

			photoObj = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.GET_PHOTO_DETAIL), service.toString());

			if(photoObj.get(WSConstant.WEB_SERVICE_RESULT) == null)
				return MessageUtility.setError(MessageList.PHOTO_NOT_FOUND);

			serviceDataWbResult = new JSONObject(photoObj.get(WSConstant.WEB_SERVICE_RESULT).toString());

			return JsonUtility.convertJsonObjectsToValueObject(serviceDataWbResult);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			serviceDataWbResult			= null;
			photoObj					= null;
		}
	}
}
