package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.properties.BranchExpenseConfigurationBllImpl;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class BranchExpenseSuccessAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= (Executive) request.getSession().getAttribute("executive");

			final var	expenseConfiguration			= BranchExpenseConfigurationBllImpl.getInstance().getBranchExpenseProperty(executive.getAccountGroupId());

			request.setAttribute(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_NEW_FLOW_ALLOW, (boolean) expenseConfiguration.getOrDefault(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_NEW_FLOW_ALLOW, false));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
