package com.ivcargo.actions.masters;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentBookingSourceMapDao;
import com.platform.dto.CrossingAgentBookingSourceMap;
import com.platform.dto.Executive;

public class CrossingAgentBookingLocationMasterAction implements Action{
	public static final String TRACE_ID = "CrossingAgentBookingLocationMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	filter 					= JSPUtility.GetInt(request, "filter",0);
			final var	sourceBranchId			= JSPUtility.GetLong(request, "srcBranchId",0);
			final var	bookingCrossingAgentId	= JSPUtility.GetLong(request, "crossingAgentId",0);
			final var	executive				= (Executive) request.getSession().getAttribute("executive");
			final var	cache					= new CacheManip(request);

			switch (filter) {
			case 1:
				final var	crossingAgentMapArr = CrossingAgentBookingSourceMapDao.getInstance().getCrossingAgentBookingSourceMap(executive.getAccountGroupId(), bookingCrossingAgentId, sourceBranchId);

				if(ObjectUtils.isNotEmpty(crossingAgentMapArr) ){
					final var	agentMapList = new ArrayList<CrossingAgentBookingSourceMap>();

					for (final CrossingAgentBookingSourceMap element : crossingAgentMapArr)
						if(element.getStatus() == CrossingAgentBookingSourceMap.CROSSING_AGENT_MAPPING_BRANCH_ACTIVE && !element.isMarkForDelete()) {
							element.setBookingLocationName(cache.getGenericBranchDetailCache(request, element.getBookingLocationId()).getName());
							agentMapList.add(element);
						}

					final var	agentMapArr = new CrossingAgentBookingSourceMap[agentMapList.size()];
					agentMapList.toArray(agentMapArr);
					request.setAttribute("agentMapArr", agentMapArr);
				}

			default:
				break;
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
