package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.CrossingExpenseReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.TransportCommonMaster;

public class InitializeCrossingExpenseReportReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final Map<Long, String>	incomingOutgoingHM	= new HashMap<>();

			incomingOutgoingHM.put(TransportCommonMaster.INCOMING_ID, TransportCommonMaster.INCOMING_NAME);
			incomingOutgoingHM.put(TransportCommonMaster.OUTGOING_ID, TransportCommonMaster.OUTGOING_NAME);

			final var	configObject				= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.CROSSING_EXPENSE_REPORT, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, configObject.getOrDefault(CrossingExpenseReportConfigurationConstant.IS_ALL_BRANCHES_NEED_TO_SHOW,false));
			request.setAttribute("incomingOutgoingHM", incomingOutgoingHM);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}