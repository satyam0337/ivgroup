package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.configuration.report.dispatch.BookButNotDispatchReportConfigurationDTO;

public class InitializeBookButNotDispatchReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOK_BUT_NOT_DISPATCH, executive.getAccountGroupId());

			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_SAID_TO_CONTAIN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_SAID_TO_CONTAIN, false));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_DECLARED_VALUE_COLUMN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_DECLARED_VALUE_COLUMN, true));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_REMARK_COLUMN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_REMARK_COLUMN, false));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_TOTAL_AMOUNT, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_TOTAL_AMOUNT, false));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_FRIEGHT_AMOUNT_COLUMN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_FRIEGHT_AMOUNT_COLUMN, true));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_INVOICE_NO_COLUMN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_INVOICE_NO_COLUMN, false));
			request.setAttribute(BookButNotDispatchReportConfigurationDTO.SHOW_NO_OF_DAYS_COLUMN, configuration.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_NO_OF_DAYS_COLUMN, true));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}