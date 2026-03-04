/**
 * Anant 12-May-2024 9:37:43 am 2024
 */
package com.ivcargo.actions.masters.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.master.ExecutiveMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeEditPasswordAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	executiveMasterConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXECUTIVE_MASTER);

			request.setAttribute(ExecutiveMasterConfigurationConstant.ENFORCE_STRICT_PASSWORD_POLICY, (boolean) executiveMasterConfig.getOrDefault(ExecutiveMasterConfigurationConstant.ENFORCE_STRICT_PASSWORD_POLICY, false));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}
