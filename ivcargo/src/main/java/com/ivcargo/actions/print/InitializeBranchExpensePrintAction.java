/**
 *
 */
package com.ivcargo.actions.print;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

/**
 * @author Manish Kumar Singh Date: 13-07-2016
 *
 */
public class InitializeBranchExpensePrintAction implements Action {

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 				error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	isLaserPrint = JSPUtility.GetBoolean(request, "isLaserPrint", false);

			final var	cacheManip	= new CacheManip(request);
			final var	executive	= cacheManip.getExecutive(request);
			final var	voucherDetailsId 	= JSPUtility.GetLong(request, "voucherDetailsId", 0);

			request.setAttribute("voucherDetailsId", voucherDetailsId);
			request.setAttribute("accountGroupId", executive.getAccountGroupId());
			request.setAttribute("nextPageToken", "success");

			final var branchExpeseConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE);
			final var branchExpensePrintFromWS	= (boolean) branchExpeseConfig.getOrDefault(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_FROM_WS, false);

			if(branchExpensePrintFromWS || executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_SWARAJ) {
				response.sendRedirect("prints.do?pageId=340&eventId=10&modulename=branchExpenseVoucherPrint&masterid=" + voucherDetailsId);
				return;
			}

			if(isLaserPrint)
				request.setAttribute("nextPageToken", "success_ledger_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
