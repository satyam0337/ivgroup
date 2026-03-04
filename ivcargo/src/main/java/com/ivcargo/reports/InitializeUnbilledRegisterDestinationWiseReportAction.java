package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.modules.UnbuildRegisterDestinationWiseReportConfigurationDTO;
import com.platform.dto.model.UnbilledRegisterCreditorWiseReport;
import com.platform.dto.model.UnbilledRegisterDestinationWiseReport;

public class InitializeUnbilledRegisterDestinationWiseReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);
			final var	cacheManip		= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.UNBILLED_REGISTER_DESTINATION_WISE_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	configuration 		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.UNBILLED_REGISTER_DESTINATION_WISE_REPORT, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_FREIGHT_COLUMN, configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_FREIGHT_COLUMN, false));
			request.setAttribute(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_GRAND_TOTAL_COLUMN, configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_GRAND_TOTAL_COLUMN, false));

			final Map<Integer, String>	timeDurationHM	= new HashMap<>();

			timeDurationHM.put(UnbilledRegisterDestinationWiseReport.THREE_MONTHS_VALUE, Integer.toString(UnbilledRegisterDestinationWiseReport.THREE_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterDestinationWiseReport.SIX_MONTHS_VALUE, Integer.toString(UnbilledRegisterDestinationWiseReport.SIX_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE, Integer.toString(UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE));
			timeDurationHM.put(UnbilledRegisterDestinationWiseReport.CUSTOM_DATE_ID, "Custom");

			request.setAttribute("timeDurationHM", timeDurationHM);
			request.setAttribute(UnbuildRegisterDestinationWiseReportConfigurationDTO.ALLOW_CUSTOM_DATE, configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.ALLOW_CUSTOM_DATE, false));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}