package com.ivcargo.reports;

import java.util.ArrayList;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.master.DivisionMaster;
import com.iv.properties.constant.report.LhpvRegisterReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeLHPVDetailsReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.LHPV_REGISTER_REPORT, executive.getAccountGroupId());

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var originalList		= cache.getDivisionMasterList(request, executive.getAccountGroupId());

			final var divisionArrList = new ArrayList<>(originalList);

			final var allDivision = new DivisionMaster();
			allDivision.setDivisionMasterId(0L);
			allDivision.setName("ALL");
			divisionArrList.add(0, allDivision);

			request.setAttribute("showOneYearHistoryForGroupAdmin", (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_ONE_YEAR_HISTORY_FOR_GROUP_ADMIN, false)
					&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN);
			request.setAttribute(LhpvRegisterReportConfigurationConstant.GENERATE_TALLY_TRANSFER_EXCEL, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.GENERATE_TALLY_TRANSFER_EXCEL, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.IS_ALL_REGION_NEED_TO_SHOW, false));
			request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_VEHICLE_AGENT_WISE_DATA, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_VEHICLE_AGENT_WISE_DATA, false));
			request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_DRIVER_NAME_WISE_DATA, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_DRIVER_NAME_WISE_DATA, false));
			request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_DIVISION_NAME_COLUMN, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_DIVISION_NAME_COLUMN, false));
			request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_DIVISION_SELECTION, configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_DIVISION_SELECTION, false));
			request.setAttribute(DivisionMaster.DIVISION_LIST, divisionArrList);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}