
package com.ivcargo.actions;

import java.util.ArrayList;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.TrafficWiseSearchPropertiesConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchWiseTrafficConfigurationDao;
import com.platform.dao.TrafficExecutiveDao;
import com.platform.dto.Branch;
import com.platform.dto.BranchWiseTrafficConfiguration;

public class InitializeTrafficWiseSearchAction implements Action {

	public static final String TRACE_ID = "InitializeTrafficWiseSearchAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object> error = null;
		BranchWiseTrafficConfiguration[] finalBranchWiseTrafficConfigArr = null;
		Branch											branch							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache = new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			final var	configuration 					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRAFFIC_SUMMARY);
			final var	showCrossingBranch				= (boolean) configuration.getOrDefault(TrafficWiseSearchPropertiesConstant.SHOW_CROSSING_BRANCH, true);
			final var	showDeliveryBranch				= (boolean) configuration.getOrDefault(TrafficWiseSearchPropertiesConstant.SHOW_DELIVERY_BRANCH, true);
			final var	showDeactivateBranch			= (boolean) configuration.getOrDefault(TrafficWiseSearchPropertiesConstant.SHOW_DEACTIVATE_BRANCH, true);
			final var	branchWiseTrafficConfigList		= new ArrayList<BranchWiseTrafficConfiguration>();
			var	crossingBranchList				= new ArrayList<Branch>();

			final var	subRegionArr = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			final var	trafficExecutiveHM = TrafficExecutiveDao.getInstance().getTrafficExecutive(executive.getAccountGroupId(), Long.toString(executive.getExecutiveId()));

			if (trafficExecutiveHM != null && trafficExecutiveHM.size() > 0) {
				final var	trafficExecutive = trafficExecutiveHM.get(executive.getExecutiveId());

				if (trafficExecutive != null) {
					final var	branchWiseTrafficConfigArr = BranchWiseTrafficConfigurationDao.getInstance().findByTrafficId(trafficExecutive.getTrafficMasterId());

					for (final BranchWiseTrafficConfiguration element : branchWiseTrafficConfigArr) {
						branch = cache.getGenericBranchDetailCache(request, element.getBranchId());
						element.setBranchName(branch.getName());

						if(!showDeactivateBranch && branch.getStatus() == Branch.BRANCH_ACTIVE && !branch.isMarkForDelete()) {
							if(branch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY) {
								if(showDeliveryBranch)
									branchWiseTrafficConfigList.add(element);
							} else
								branchWiseTrafficConfigList.add(element);
						} else if(showDeactivateBranch)
							branchWiseTrafficConfigList.add(element);
					}
				}

				if(showCrossingBranch) {
					final Map<Long, Branch>	allCrossingBranches = cache.getCrossingBranches(request, executive.getAccountGroupId());

					crossingBranchList	= (ArrayList<Branch>) allCrossingBranches.values().stream().filter(e -> e.getStatus() == Branch.BRANCH_ACTIVE && !e.isMarkForDelete())
							.collect(CollectionUtility.getList());
				}
			}

			if(branchWiseTrafficConfigList != null && !branchWiseTrafficConfigList.isEmpty()) {
				finalBranchWiseTrafficConfigArr = new BranchWiseTrafficConfiguration[branchWiseTrafficConfigList.size()];
				branchWiseTrafficConfigList.toArray(finalBranchWiseTrafficConfigArr);
			}

			if (finalBranchWiseTrafficConfigArr == null)
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=18");
			else {
				request.setAttribute("branchWiseTrafficConfigArr", finalBranchWiseTrafficConfigArr);
				request.setAttribute("subRegionArr", subRegionArr);
				request.setAttribute("crossingBranchList",crossingBranchList);
				request.setAttribute("showCrossingBranch",showCrossingBranch);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}