package com.ivcargo.utils.services;

import org.json.JSONObject;

import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.MessageUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.constant.WSConstant;

public class ServicePermissionUtility {

	private static final String TRACE_ID = ServicePermissionUtility.class.getName();

	public static ValueObject getServicePermission(ValueObject valObjIn) throws Exception {

		JSONObject		servicePermissionWbResult	= null;
		ValueObject		checkPermission				= null;

		try {

			//service permission
			final StringBuilder service = new StringBuilder();
			service.append("&servicePermissionUserId="+valObjIn.getLong("userId", 0));
			service.append("&serviceId="+valObjIn.getLong("serviceId"));

			checkPermission = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(""+WebServiceURI.CHECKING_PERMISSION_USING_USERID), service.toString());

			if(checkPermission	== null || checkPermission.get(WSConstant.WEB_SERVICE_RESULT) == null)
				return null;

			servicePermissionWbResult = new JSONObject(checkPermission.get(WSConstant.WEB_SERVICE_RESULT).toString());
			checkPermission   = JsonUtility.convertJsonObjectsToValueObject(servicePermissionWbResult);

			if(checkPermission == null || MessageUtility.isMessage(checkPermission))
				return null;

			return checkPermission;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			servicePermissionWbResult	= null;
			checkPermission				= null;
		}
	}
}

