package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.CreditCollectionPaymentConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeCreditCollectionPaymentAction implements Action{
	public static final String TRACE_ID = "InitializeCreditCollectionPaymentAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 						= null;

		try {
			error 		= ActionStaticUtil.getSystemErrorColl(request);

			final var	cacheManip	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var 	configHM				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT);
			final var	oneYearSelectionInDate 	= (boolean) configHM.getOrDefault(CreditCollectionPaymentConfigurationConstant.ONE_YEAR_SELECTION_IN_DATE, false);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute("oneYearSelectionInDate", oneYearSelectionInDate);
			request.setAttribute("nextPageToken", "success");

			request.setAttribute(CreditCollectionPaymentConfigurationConstant.LR_CREDIT_CONFIGURATION, configHM);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}