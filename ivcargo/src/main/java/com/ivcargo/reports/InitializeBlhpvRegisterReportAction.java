package com.ivcargo.reports;

import java.util.ArrayList;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BlhpvRegisterReportConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.master.DivisionMaster;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeBlhpvRegisterReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			final var	blhpvConfiguration	= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BLHPV_REGISTER_REPORT, executive.getAccountGroupId());

			final var originalList		= cache.getDivisionMasterList(request, executive.getAccountGroupId());
			final var divisionArrList = new ArrayList<>(originalList);
			final var allDivision = new DivisionMaster();

			allDivision.setDivisionMasterId(0L);
			allDivision.setName("ALL");
			divisionArrList.add(0, allDivision);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_ALL_OPTION_IN_REGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(DivisionMaster.DIVISION_LIST, divisionArrList);
			request.setAttribute(BlhpvRegisterReportConstant.SHOW_DIVISION_NAME_COLUMN, blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_DIVISION_NAME_COLUMN, false));
			request.setAttribute(BlhpvRegisterReportConstant.SHOW_DIVISION_SELECTION, blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_DIVISION_SELECTION, false));

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}