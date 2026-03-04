
package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.LSSequenceCounterDao;
import com.platform.dao.OutboundCargoDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.LSSequenceCounter;

public class InitializeTransportManualDispatchWayBillAction implements Action {
	public static final String TRACE_ID = "InitializeTransportManualDispatchWayBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 			= null;
		ArrayList<Long> 			transportList	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final CacheManip 	cache   	= new CacheManip(request);
			final Executive   executive 	= cache.getExecutive(request);
			transportList			= cache.getTransportList(request);

			if(transportList.contains(executive.getAccountGroupId()))
				//specify the sequenceCounter type for RANGE_INCREMENT(DB check) --- By Prakash
				request.setAttribute("LSSequenceCounter", LSSequenceCounterDao.getInstance().getLSSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), LSSequenceCounter.LS_SEQUENCE_MANUAL));

			//Routing Allowed For Group Coding Started
			String routingAllowed = "";
			final short rateConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ROUTING_ALLOWED);

			if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_YES)
				routingAllowed = "YES";
			else if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_NO)
				routingAllowed = "NO";

			request.setAttribute("routingAllowed", routingAllowed);
			//Routing Allowed For Group Coding End

			final short 			dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			Branch[]		srcBranchArr					= null;
			final StringBuilder 	dispatchBranchListStr 			= new StringBuilder();
			final StringBuilder 	dispatchBranchIdsStr 			= new StringBuilder();
			Executive[]		executiveArr					= null;
			String			executiveStr					= null;

			if(transportList.contains(executive.getAccountGroupId())) {
				executiveArr = ExecutiveDao.getInstance().findByBranchId(executive.getBranchId());

				executiveStr	= Arrays.asList(executiveArr).stream().map(e -> e.getExecutiveId() + "").collect(Collectors.joining(","));
				final ArrayList<Long> srcBranchIdsList  = OutboundCargoDao.getInstance().getSourceAndDestinationBranchIdsForDispatch(executive.getAccountGroupId(), executive.getBranchId(), dispatchConfigValue, executiveStr, (short)1);

				if(srcBranchIdsList != null && !srcBranchIdsList.isEmpty()) {
					srcBranchArr = new Branch[srcBranchIdsList.size()];

					for (int i = 0; i < srcBranchIdsList.size(); i++)
						srcBranchArr[i] = cache.getGenericBranchDetailCache(request, srcBranchIdsList.get(i));
				}

				request.setAttribute("dispatchBranchListStr", dispatchBranchListStr.toString());
				request.setAttribute("dispatchBranchIdsStr", dispatchBranchIdsStr.toString());
				request.setAttribute("srcBranchArr", srcBranchArr);
				request.setAttribute("executiveStr", executiveStr);
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			}

			/*********************Make Shared Branches Collection (Start)*******************/
			request.setAttribute("sharedBranches", cache.getSharedBranchesList(request, executive.getAccountGroupId()));
			/*********************Make Shared Branches Collection (End)*******************/

			if (executive.getAccountGroupId()== TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}