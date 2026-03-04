package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.fleet.TruckMovementReportConfigurationDTO;

public class InitializeTruckMovementReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= (Executive) request.getSession().getAttribute("executive");
			final var	configuration 	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.TRUCK_MOVEMENT_REPORT, executive.getAccountGroupId());

			var	showOneYearHistoryForGroupAdmin = configuration.getBoolean(TruckMovementReportConfigurationDTO.SHOW_ONE_YEAR_HISTORY_FOR_GROUP_ADMIN);
			final var	showOwnVehicleCheckbox			= configuration.getBoolean(TruckMovementReportConfigurationDTO.SHOW_OWN_VEHICLE_CHECK_BOX);

			if(showOneYearHistoryForGroupAdmin)
				showOneYearHistoryForGroupAdmin = executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN;

			request.setAttribute("showOneYearHistoryForGroupAdmin", showOneYearHistoryForGroupAdmin);
			request.setAttribute("showOwnVehicleCheckbox", showOwnVehicleCheckbox);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}
}