package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.CrossingAgentBilledInformationReportConfigurationDTO;
import com.platform.dto.model.UnbilledRegisterCreditorWiseReport;

public class InitializeCrossingAgentBillInformationBranchWiseReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 								= null;
		Map<Integer, String>		timeDurationHM						= null;
		ValueObject					reportConfig						= null;
		boolean						showMonthSelection					= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final CacheManip cache = new CacheManip(request);
			final Executive   executive = cache.getExecutive(request);
			timeDurationHM	= new HashMap<Integer, String>();
			reportConfig	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CROSSING_AGENT_BILL_INFORMATION_BRANCH_WISE_REPORT, executive.getAccountGroupId());
			showMonthSelection		= reportConfig.getBoolean(CrossingAgentBilledInformationReportConfigurationDTO.SHOW_CROSSING_AGENT_BILLED_INFORMATION_LR_WISE, false);
			
			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE, UnbilledRegisterCreditorWiseReport.THREE_MONTHS_VALUE + "");
			timeDurationHM.put(UnbilledRegisterCreditorWiseReport.CUSTOM_DATE_ID, "Custom");

			request.setAttribute("timeDurationHM", timeDurationHM);
			request.setAttribute("showMonthSelection", showMonthSelection);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}