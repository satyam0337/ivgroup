package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.PendingBlhpvLedgerReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;

public class PendingBLHPVLedgerReportInitializeAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive	= ActionStaticUtil.getExecutive(request);

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_BLHPV_LEDGER_REPORT, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.IS_ALL_REGION_NEED_TO_SHOW, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.IS_ALL_AREA_NEED_TO_SHOW, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.IS_ALL_BRANCHES_NEED_TO_SHOW, false));
			request.setAttribute("showBranchWiseSelection", configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_BRANCH_WISE_SELECTION, false));
			request.setAttribute(PendingBlhpvLedgerReportConfigurationConstant.SHOW_BRANCH_PAYABLE_AT_SELECTION, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_BRANCH_PAYABLE_AT_SELECTION, false));
			request.setAttribute(PendingBlhpvLedgerReportConfigurationConstant.SHOW_DATE_RANGE_SELECTION, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_DATE_RANGE_SELECTION, false));
			request.setAttribute(PendingBlhpvLedgerReportConfigurationConstant.SHOW_SEACH_BY_DATE_SELECTION, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_SEACH_BY_DATE_SELECTION, false));
			request.setAttribute(PendingBlhpvLedgerReportConfigurationConstant.SEARCH_BY_VEHICLE_AGENT, configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SEARCH_BY_VEHICLE_AGENT, false));

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			request.setAttribute("vehicleAgentDetails", true);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
