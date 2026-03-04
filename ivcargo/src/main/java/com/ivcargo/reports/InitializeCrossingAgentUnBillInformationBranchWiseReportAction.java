package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.CrossingAgentUnBilledInformationReportConfigurationDTO;
import com.platform.dto.model.UnbilledRegisterCreditorWiseReport;

public class InitializeCrossingAgentUnBillInformationBranchWiseReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		Map<Integer, String>	timeDurationHM								= null;
		ValueObject				reportConfig								= null;
		boolean					showCrossingAgentUnBilledInformationLrWise	= false;
		boolean					allOptionInRegion							= false;
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive = ActionStaticUtil.getExecutive(request);
			
			timeDurationHM	= new HashMap<Integer, String>();
			reportConfig			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CROSSING_AGENT_UNBILL_INFORMATION_BRANCH_WISE_REPORT, executive.getAccountGroupId());
			showCrossingAgentUnBilledInformationLrWise	= reportConfig.getBoolean(CrossingAgentUnBilledInformationReportConfigurationDTO.SHOW_CROSSING_AGENT_UNBILLED_INFORMATION_LR_WISE, false);
			allOptionInRegion							= reportConfig.getBoolean(CrossingAgentUnBilledInformationReportConfigurationDTO.IS_ALL_REGION_NEED_TO_SHOW, false);
			
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE, UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE + "");
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.SIX_MONTHS_VALUE, UnbilledRegisterCreditorWiseReport.SIX_MONTHS_VALUE + "");
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE, UnbilledRegisterCreditorWiseReport.TWELVE_MONTHS_VALUE + "");
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.CUSTOM_DATE_ID, "Custom");
			

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, allOptionInRegion);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("timeDurationHM", timeDurationHM);
			request.setAttribute("showCrossingAgentUnBilledInformationLrWise", showCrossingAgentUnBilledInformationLrWise);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}