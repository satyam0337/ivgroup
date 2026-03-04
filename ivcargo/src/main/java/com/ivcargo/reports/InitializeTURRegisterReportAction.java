package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.TurReportConfigurationDTO;

public class InitializeTURRegisterReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		var						showRegionSelectionForRegionAdmin		= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip	= new CacheManip(request);

			final var	executive = cacheManip.getExecutive(request);

			final var	turConfiguration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.TUR_REGISTER, executive.getAccountGroupId());

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				showRegionSelectionForRegionAdmin		= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_REGION_SELECTION_FOR_REGION_ADMIN, false);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.SHOW_REGION_SELECTION_FOR_REGION_ADMIN, showRegionSelectionForRegionAdmin);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			final var	execFldPermissionsHM 			= cacheManip.getExecutiveFieldPermission(request);

			final var	showArrivalDateTimeColumn		= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_ARRIVAL_DATE_TIME_COLUMN, false);
			final var	showLorryHireColumn				= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_COLUMN, false);
			final var	showLorryHireAdvanceColumn		= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_ADVANCE_COLUMN, false);
			final var	showLorryHireBalanceColumn		= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_BALANCE_COLUMN, false);
			final var	showLhpvDetails					= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LHPV_DETAILS, false);
			final var	showAllOptionInBranch			= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_ALL_OPTION_IN_BRANCH, false);

			if(showAllOptionInBranch && execFldPermissionsHM.get(FeildPermissionsConstant.SHOW_LHPV_DETAILS_IN_TUR_REPORT_FOR_EXCEL) == null)
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			request.setAttribute(TurReportConfigurationDTO.SHOW_ARRIVAL_DATE_TIME_COLUMN, showArrivalDateTimeColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_COLUMN, showLorryHireColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_ADVANCE_COLUMN, showLorryHireAdvanceColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_BALANCE_COLUMN, showLorryHireBalanceColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LHPV_DETAILS, showLhpvDetails);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}