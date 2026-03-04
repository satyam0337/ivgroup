package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.configuration.report.account.BranchWiseTDSReportConfigurationDTO;

public class InitializeBranchWiseTDSTempAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_TDS_DETAILS, executive.getAccountGroupId());
			final var	showTanNumberColumn			= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.SHOW_TAN_NUMBER_COLUMN,false);
			final var	showOneYearDate				= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.SHOW_ONE_YEAR_DATE,false);
			final var	showRoundOfOnTDSAmount		= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.SHOW_ROUND_OF_ON_TDS_AMOUNT,false);
			final var	showRoundOfOnTDSONAmount	= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.SHOW_ROUND_OF_ON_TDS_ON_AMOUNT,false);
			final var	isAllowSearchByParty		= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.IS_ALLOW_SEARCH_BY_PARTY,false);
			final var	showPaymentModeColumn			= configuration.getBoolean(BranchWiseTDSReportConfigurationDTO.SHOW_PAYMENT_MODE_COLUMN,false);

			request.setAttribute(BranchWiseTDSReportConfigurationDTO.SHOW_TAN_NUMBER_COLUMN, showTanNumberColumn);
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(BranchWiseTDSReportConfigurationDTO.SHOW_ONE_YEAR_DATE,showOneYearDate);
			request.setAttribute(BranchWiseTDSReportConfigurationDTO.SHOW_ROUND_OF_ON_TDS_AMOUNT,showRoundOfOnTDSAmount);
			request.setAttribute(BranchWiseTDSReportConfigurationDTO.SHOW_ROUND_OF_ON_TDS_ON_AMOUNT,showRoundOfOnTDSONAmount);
			request.setAttribute(BranchWiseTDSReportConfigurationDTO.IS_ALLOW_SEARCH_BY_PARTY,isAllowSearchByParty);
			request.setAttribute(BranchWiseTDSReportConfigurationDTO.SHOW_PAYMENT_MODE_COLUMN, showPaymentModeColumn);


			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}