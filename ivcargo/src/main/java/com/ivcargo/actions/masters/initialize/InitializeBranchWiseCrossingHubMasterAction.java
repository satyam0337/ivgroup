/**
 *
 */
package com.ivcargo.actions.masters.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.Executive;

/**
 * @author Anant Chaudhary	17-12-2015
 *
 */
public class InitializeBranchWiseCrossingHubMasterAction implements Action {

	public static final String TRACE_ID = "InitializeBranchWiseCrossingHubMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>		error 				= null;
		CacheManip					cache				= null;
		Executive					executive			= null;
		Executive[]					executiveArr		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			cache			= new CacheManip(request);
			executive		= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection(request, cache, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
				executiveArr 	= ExecutiveDao.getInstance().findByBranchId(executive.getBranchId());
				request.setAttribute("executiveArr", executiveArr);
			}
			
			request.setAttribute("ourNetwork", AccountGroupNetworkConfiguration.NETWORK_TYPE_OWN);
			request.setAttribute("sharedNetwork", AccountGroupNetworkConfiguration.NETWORK_TYPE_OWN_TIE_UP);
			request.setAttribute("branchWiseCrossingHubMasterName", AccountGroupPermissionsBllImpl.getInstance().getDisplayNameOfExecutivePermissions(cache.getGroupPermissionHMByUniqueName(request, executive.getAccountGroupId()), BusinessFunctionConstants.BRANCHWISE_CROSSING_HUB_MASTER));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			cache				= null;
			executive			= null;
			executiveArr		= null;
		}
	}

}
