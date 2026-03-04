package com.ivcargo.actions.ddmSettlement;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.utils.TokenGenerator;

public class InitializeDDMSettlementAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache						= new CacheManip(request);
			final var executive						= cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var ddmSettlementConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);
			final var tokenWiseCheckingForDuplicateTransaction		= (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			request.setAttribute("isNormalUser", executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN);
			request.setAttribute("removeBranchNameForNormalExecutive", (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.REMOVE_BRANCH_NAME_FOR_NORMAL_EXECUTIVE, false));
			request.setAttribute("showTwentyLRInOnePageForDDMSettlement", (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.SHOW_TWENTY_LR_IN_ONEPAGE_FOR_DDM_SETTLEMENT, false));

			if(tokenWiseCheckingForDuplicateTransaction && request.getSession().getAttribute(TokenGenerator.DDM_SETTLEMENT_KEY) == null) {
				final var token = TokenGenerator.nextToken();
				request.setAttribute(TokenGenerator.DDM_SETTLEMENT_KEY, token);
				request.getSession().setAttribute(TokenGenerator.DDM_SETTLEMENT_KEY, token);
				request.setAttribute(DDMSettlementPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, tokenWiseCheckingForDuplicateTransaction);
			}

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}