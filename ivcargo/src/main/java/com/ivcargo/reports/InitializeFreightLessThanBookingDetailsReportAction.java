package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.configuration.modules.FreightLessThanAmountBookingDetailConfigurationDTO;

public class InitializeFreightLessThanBookingDetailsReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			final var	executive = ActionStaticUtil.getExecutive(request);

			if (executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.FREIGHT_LESS_THAN_AMOUNT_BOOKING_DETAILS, executive.getAccountGroupId());
			final var	defaultAmount	= configuration.getBoolean(FreightLessThanAmountBookingDetailConfigurationDTO.DEFAULT_AMOUNT,false);
			final var	defaultValue	= configuration.getDouble(FreightLessThanAmountBookingDetailConfigurationDTO.DEFAULT_VALUE,0);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("isDefaultRegionAllSelection",    true);
			request.setAttribute("isDefaultSubRegionAllSelection", true);
			request.setAttribute("isDefaultBranchAllSelection", true);
			request.setAttribute("isAssignedLocationsNeedToShow", false);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("defaultValue", defaultValue);
			request.setAttribute("defaultAmount", defaultAmount);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}
}