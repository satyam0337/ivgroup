package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillPaymentDAO;
import com.platform.dto.CrossingAgentDetails;

public class InitializeCrossingAgentBillCancleAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		HashMap<Long, CrossingAgentDetails> crossingAgentColl	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip			= new CacheManip(request);
			final var	executive 		= cManip.getExecutive(request);

			final var configuration		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			request.setAttribute("isShowType", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false));
			request.setAttribute("showNetAmountWithHalfPaidAndTBBAmount", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_NET_AMT_WITH_HALF_PAID_AND_TBB_AMT, false));

			final var	branchIds	= cManip.getBranchIdsByExecutiveType(request, executive);

			final var	crossingAgentDetails = CrossingAgentBillPaymentDAO.getInstance().getCrossingAgentDetailsForCancelBill(executive.getAccountGroupId() ,branchIds);

			if(crossingAgentDetails != null && crossingAgentDetails.length > 0) {
				crossingAgentColl	= new LinkedHashMap<>();

				for (final CrossingAgentDetails crossingAgentDetail : crossingAgentDetails)
					crossingAgentColl.put(crossingAgentDetail.getCrossingAgentId(), crossingAgentDetail);
			}

			request.setAttribute("CrossingAgentColl", crossingAgentColl);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}