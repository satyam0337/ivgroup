package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.DispatchLedger;
import com.platform.dto.configuration.report.account.BookingAmountLSWiseSummaryConfigurationDTO;

public class InitializeBookingAmountLSWiseSummaryReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			final var	configuration			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_AMOUNT_LS_WISE_SUMMARY_REPORT, executive.getAccountGroupId());
			final var	displayFreightColumn	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_FREIGHT_COLUMN);
			final var	displayOctroiColumn		= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_OCTROI_COLUMN);
			final var	displayCartingColumn	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_CARTING_COLUMN);
			final var	showPaidCashlessColumn	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_PAID_CASHLESS_COLUMN);
			final var	showTopayCashlessColumn	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TOPAY_CASHLESS_COLUMN);
			final var	showTbbDataInReports	= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TBB_DATA_IN_REPORTS);
			final var	showTbbColumn			= configuration.getBoolean(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TBB_COLUMN);

			final Map<Short, String>	typeOfLSHM		= new LinkedHashMap<>();

			typeOfLSHM.put(DispatchLedger.TYPE_OF_LS_ID_NORMAL, DispatchLedger.TYPE_OF_LS_NAME_NORMAL);
			typeOfLSHM.put(DispatchLedger.TYPE_OF_LS_ID_DDM, DispatchLedger.TYPE_OF_LS_NAME_DDM);
			typeOfLSHM.put(DispatchLedger.TYPE_OF_LS_ID_Inter_Branch, DispatchLedger.TYPE_OF_LS_NAME_Inter_Branch);

			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_FREIGHT_COLUMN, displayFreightColumn);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_OCTROI_COLUMN, displayOctroiColumn);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.DISPLAY_CARTING_COLUMN, displayCartingColumn);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_PAID_CASHLESS_COLUMN, showPaidCashlessColumn);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TOPAY_CASHLESS_COLUMN, showTopayCashlessColumn);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TBB_DATA_IN_REPORTS, showTbbDataInReports);
			request.setAttribute(BookingAmountLSWiseSummaryConfigurationDTO.SHOW_TBB_COLUMN, showTbbColumn);
			request.setAttribute("typeOfLSHM", typeOfLSHM);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}