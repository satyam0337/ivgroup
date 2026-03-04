package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dto.WayBillDetailsForOctroiConfirmation;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class TransportOctroiConfirmationAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 				error 				= null;
		WayBillDetailsForOctroiConfirmation[] 	model 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip		= new CacheManip(request);

			new InitializeTransportOctroiConfirmationAction().execute(request, response);

			final var	executive			= cacheManip.getExecutive(request);

			final var	minDateTimeStamp	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_BILL_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_BILL_MIN_DATE);

			final var	selectedVehicleNoId	= JSPUtility.GetLong(request, "selectedVehicleNoId", 0);

			if(minDateTimeStamp != null)
				model 				= ChargeConfigDao.getInstance().getDataForOctroiConfirmationFromMinDate(selectedVehicleNoId, executive.getAccountGroupId(), minDateTimeStamp);
			else
				model 				= ChargeConfigDao.getInstance().getDataForOctroiConfirmation(selectedVehicleNoId, executive.getAccountGroupId());

			if(model != null)
				request.setAttribute("WayBillDetailsForOctroiConfirmation", model);
			else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}
}