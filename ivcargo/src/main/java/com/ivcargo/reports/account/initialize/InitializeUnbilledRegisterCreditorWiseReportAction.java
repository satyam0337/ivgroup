package com.ivcargo.reports.account.initialize;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.constant.properties.UnbilledRegisterCreditorReportConfigPropertiesConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.model.UnbilledRegisterCreditorWiseReport;

public class InitializeUnbilledRegisterCreditorWiseReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>					error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip			= new CacheManip(request);
			final var	executive 			= cacheManip.getExecutive(request);
			final var	execFeildPermission = cacheManip.getExecutiveFieldPermission(request);
			final var	groupConfiguration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.UNBILLED_REGISTER_CREDITOR_WISE_REPORT, executive.getAccountGroupId());

			final var	showDownloadExcelButton	= groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DOWNLOAD_EXCEL_BUTTON, false) || execFeildPermission != null && execFeildPermission.containsKey(FeildPermissionsConstant.ALLOW_DOWNLOAD_TO_EXCEL_IN_UNBILLED_REGISTER_REPORT);

			final Map<Integer, String>	timeDurationHM	= new HashMap<>();

			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE, Integer.toString(UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.SIX_MONTHS_VALUE, Integer.toString(UnbilledRegisterCreditorWiseReport.SIX_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE, Integer.toString(UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.CUSTOM_DATE_ID, "Custom");

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.ALL_OPTIONS_FOR_REGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("reportName", AccountGroupPermissionsBllImpl.getInstance().getDisplayNameOfExecutivePermissions(cacheManip.getGroupPermissionHMByUniqueName(request, executive.getAccountGroupId()), BusinessFunctionConstants.UNBILLED_REGISTER_CREDITOR_WISE_REPORT));
			request.setAttribute("timeDurationHM", timeDurationHM);
			request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_PARTY_SELECTION, groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_PARTY_SELECTION, false));
			request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DOWNLOAD_EXCEL_BUTTON, showDownloadExcelButton);
			request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DESTINATION_BRANCH_SELECTION, groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DESTINATION_BRANCH_SELECTION, false));
			request.setAttribute("isAssignedDestLocationsNeedToShow", groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.IS_ASSIGNED_DEST_LOCATIONS_NEED_TO_SHOW, false));
			request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVE_DATE_COLUMN, groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVE_DATE_COLUMN, false));
			request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVED_BY_COLUMN, groupConfiguration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVED_BY_COLUMN, false));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}

