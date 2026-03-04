package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillDAO;
import com.platform.dto.CrossingAgentDetails;
import com.platform.dto.Executive;

public class InitializeCrossingAgentBillClearanceAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;
		Executive   						executive 					= null;
		List<CrossingAgentDetails>			crossingAgentDetails 		= null;
		String								branchIds					= null;
		CacheManip							cManip						= null;
		Map<Long, CrossingAgentDetails> 	crossingAgentColl			= null;

		try  {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cManip			= new CacheManip(request);
			executive 		= cManip.getExecutive(request);
			final var configuration		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);
			branchIds		= cManip.getBranchIdsByExecutiveType(request, executive);

			request.setAttribute("isShowType", (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE,false));
			crossingAgentDetails = CrossingAgentBillDAO.getInstance().getCrossingAgentDetails(executive.getAccountGroupId(), branchIds);

			if(crossingAgentDetails != null && !crossingAgentDetails.isEmpty()) {
				crossingAgentColl = new LinkedHashMap<>();

				for (final CrossingAgentDetails crossingAgentDetail : crossingAgentDetails)
					crossingAgentColl.put(crossingAgentDetail.getCrossingAgentId(), crossingAgentDetail);
			}

			request.setAttribute("crossingAgentColl", crossingAgentColl);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 		= null;
			branchIds		= null;
			cManip			= null;
		}

	}
}