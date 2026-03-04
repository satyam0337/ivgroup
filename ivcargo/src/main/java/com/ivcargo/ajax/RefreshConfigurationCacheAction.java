/**
 *
 */
package com.ivcargo.ajax;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.ConfigurationCache;

/**
 * @author Anant
 *
 */
public class RefreshConfigurationCacheAction implements Action {

	private static final String TRACE_ID = RefreshConfigurationCacheAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		try {
			final var cache			= new CacheManip(request);

			var	accountGroupId  = JSPUtility.GetLong(request, Constant.ACCOUNT_GROUP_ID, 0);
			final var isDefault		= JSPUtility.GetBoolean(request, "isDefault", false);

			if(accountGroupId == 0) {
				final var	executive	= cache.getExecutive(request);
				accountGroupId	= executive.getAccountGroupId();
			}

			final var	moduleId		= JSPUtility.GetLong(request, Constant.MODULE_ID, 0);
			final var	reportId		= JSPUtility.GetLong(request, Constant.REPORT_ID, 0);

			if(moduleId == ModuleIdentifierConstant.FOLDER_LOCATION || moduleId == ModuleIdentifierConstant.SERVER_IP_ADDRESS) {
				accountGroupId	= 0;
				cache.updateWebsitePath(request);
			}

			if(moduleId > 0) {
				if(isDefault)
					ConfigurationCache.getInstance().refreshConfiguration(request, moduleId, 0);
				else if(moduleId == ModuleIdentifierConstant.CASH_STATEMENT_CONFIGURATION
						|| moduleId == ModuleIdentifierConstant.BANK_STATEMENT_CONFIGURATION
						|| moduleId == ModuleIdentifierConstant.PARTY_LEDGER_CONFIGURATION)
					cache.refreshOldConfiguration(request, accountGroupId, moduleId);
				else
					ConfigurationCache.getInstance().refreshGroupConfiguration(request, accountGroupId, moduleId, 0);

				ConfigurationCache.getInstance().refreshCommonConfiguration(request);

				if(moduleId == ModuleIdentifierConstant.SHORT_RECEIVE_LR
						|| moduleId == ModuleIdentifierConstant.DAMAGE_RECEIVE_LR
						|| moduleId == ModuleIdentifierConstant.EXCESS_RECEIVE_LR
						|| moduleId == ModuleIdentifierConstant.CLAIM_ENTRY_MODULE
						|| moduleId == ModuleIdentifierConstant.GENERAL_CONFIGURATION
						|| moduleId == ModuleIdentifierConstant.GENERATE_CR
						|| moduleId == ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION
						|| moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT
						|| moduleId == ModuleIdentifierConstant.BOOKING
						|| moduleId == ModuleIdentifierConstant.SHORT_REGISTER_SETTLEMENT
						|| moduleId == ModuleIdentifierConstant.EXCESS_REGISTER_SETTLEMENT
						|| moduleId == ModuleIdentifierConstant.DAMAGE_REGISTER_SETTLEMENT
						|| moduleId == ModuleIdentifierConstant.PENDING_SHORT_REGISTER_SETTLEMENT
						|| moduleId == ModuleIdentifierConstant.PENDING_EXCESS_REGISTER_SETTLEMENT
						|| moduleId == ModuleIdentifierConstant.PENDING_DAMAGE_REGISTER_SETTLEMENT
						)
					ConfigurationCache.getInstance().refreshOldConfiguration(request, moduleId, accountGroupId);
			}

			if(reportId > 0)
				cache.refreshReportConfiguration(request, accountGroupId, moduleId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
