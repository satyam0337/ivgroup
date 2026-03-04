package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CustomerOrderPropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeCustomerOrder implements Action{
	public static final String TRACE_ID = "InitializeCustomerOrder";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	caManip		= new CacheManip(request);
			final var	executive 	= caManip.getExecutive(request);

			final var execFldPermissions = caManip.getExecutiveFieldPermission(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("showOrderPalacingExecutive", execFldPermissions.get(FeildPermissionsConstant.SHOW_ORDER_PALACING_EXECUTIVE) != null);

			final var	customerOrderConfig			= caManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CUSTOMER_ORDER);
			request.setAttribute(CustomerOrderPropertiesConstant.CUSTOMER_ORDER_CONFIGURATION, customerOrderConfig);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
