package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.collection.BookingDetailsReportConfigurationDTO;

public class BookingDetailsInitializeAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= ActionStaticUtil.getExecutive(request);
			final var	cacheManip 		= new CacheManip(request);
			final var	configObject	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_DETAILS, executive.getAccountGroupId());
			final var	confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, configObject.getBoolean(BookingDetailsReportConfigurationDTO.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false));
			request.setAttribute(BookingDetailsReportConfigurationDTO.SHOW_GST_AMOUNT_COL, configObject.getBoolean(BookingDetailsReportConfigurationDTO.SHOW_GST_AMOUNT_COL, false));
			request.setAttribute(BookingDetailsReportConfigurationDTO.SHOW_TBB_AMOUNT_COL, configObject.getBoolean(BookingDetailsReportConfigurationDTO.SHOW_TBB_AMOUNT_COL, false));
			request.setAttribute(BookingDetailsReportConfigurationDTO.SHOW_BOOKING_COMMISSION_COL, configObject.getBoolean(BookingDetailsReportConfigurationDTO.SHOW_BOOKING_COMMISSION_COL, false));
			request.setAttribute("confValObj", confValObj);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}