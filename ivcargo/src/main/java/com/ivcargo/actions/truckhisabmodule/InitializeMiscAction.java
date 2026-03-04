package com.ivcargo.actions.truckhisabmodule;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.master.PumpNameMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeMiscAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 						= null;

		try {
			error		 				= ActionStaticUtil.getSystemErrorColl(request);
			final var cache	= new CacheManip(request);
			final var	executive 		= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	configuration 		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_NAME_MASTER);

			request.setAttribute("nextPageToken", "success");
			request.setAttribute("showAmountfield", (boolean) configuration.getOrDefault(PumpNameMasterConfigurationConstant.SHOW_AMOUNT_FIELD, false));
			request.setAttribute("showAddressfield", configuration.getOrDefault(PumpNameMasterConfigurationConstant.SHOW_ADDRESS_FIELD, false));
			request.setAttribute("showMobileNumberfield", configuration.getOrDefault(PumpNameMasterConfigurationConstant.SHOW_MOBILE_NUMBER_FIELD, false));
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}
