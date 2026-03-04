package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.utils.Utility;

public class InitializeCollectionPersonWiseSummaryReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object> 		error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 	= ActionStaticUtil.getExecutive(request);
			final var	configrtion = ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.COLLECTION_PERSON_WISE_SUMMARY_REPORT, executive.getAccountGroupId());
			final var	showExecutiveNameSelection = Utility.getBoolean(configrtion.get("showExecutiveNameSelection"));

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("showNegotiatedAmount", Utility.getBoolean(configrtion.get("showNegotiatedAmount")));
			request.setAttribute("showExecutiveNameSelection", showExecutiveNameSelection);

			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_EXECUTIVE_NEED_TO_SHOW, true);
			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}