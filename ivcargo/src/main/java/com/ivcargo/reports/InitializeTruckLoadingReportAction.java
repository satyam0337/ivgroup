package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.TruckLoadingReportConfigurationConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class InitializeTruckLoadingReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>  		error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.TRUCK_LOADING_REPORT, executive.getAccountGroupId());

			final var	showTurDetailsColumn 			= (boolean) configuration.getOrDefault(TruckLoadingReportConfigurationConstant.SHOW_TUR_DETAILS_COLUMN,false);
			var			showUnderloadWeight  			= (boolean) configuration.getOrDefault(TruckLoadingReportConfigurationConstant.SHOW_UNDER_LOAD_WEIGHT,false);
			final var	executiveIdsForUnderloadWeight 	= (String) configuration.getOrDefault(TruckLoadingReportConfigurationConstant.EXECUTIVEIDS_FOR_UNDER_LOAD_WEIGHT,"0");

			final var	executiveIdList					= CollectionUtility.getLongListFromString(executiveIdsForUnderloadWeight);

			if(showUnderloadWeight)
				showUnderloadWeight = executiveIdList.contains(executive.getExecutiveId());

			request.setAttribute(TruckLoadingReportConfigurationConstant.SHOW_TUR_DETAILS_COLUMN, showTurDetailsColumn);
			request.setAttribute(TruckLoadingReportConfigurationConstant.HIDE_STATUS_COLUMN, configuration.getOrDefault(TruckLoadingReportConfigurationConstant.HIDE_STATUS_COLUMN,false));
			request.setAttribute(TruckLoadingReportConfigurationConstant.HIDE_TYPE_OF_LHPV_COLUMN, configuration.getOrDefault(TruckLoadingReportConfigurationConstant.HIDE_TYPE_OF_LHPV_COLUMN,false));
			request.setAttribute("showUnderloadWeight", showUnderloadWeight);
			request.setAttribute(TruckLoadingReportConfigurationConstant.MONTH_LIMIT, configuration.getOrDefault(TruckLoadingReportConfigurationConstant.MONTH_LIMIT, 0));

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
