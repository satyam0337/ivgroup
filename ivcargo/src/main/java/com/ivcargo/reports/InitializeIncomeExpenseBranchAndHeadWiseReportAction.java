package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.TransportCommonMaster;

public class InitializeIncomeExpenseBranchAndHeadWiseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final Map<Short, String>	incExpTypeHM	= new LinkedHashMap<>();
			final Map<Short, String>	chargeTypeHM	= new LinkedHashMap<>();

			incExpTypeHM.put(TransportCommonMaster.CHARGE_TYPE_INCOME, TransportCommonMaster.CHARGE_TYPE_INCOME_NAME);
			incExpTypeHM.put(TransportCommonMaster.CHARGE_TYPE_EXPENSES, TransportCommonMaster.CHARGE_TYPE_EXPENSE_NAME);

			chargeTypeHM.put(TransportCommonMaster.CHARGE_TYPE_LR, TransportCommonMaster.CHARGE_TYPE_LR_NAME);
			chargeTypeHM.put(TransportCommonMaster.CHARGE_TYPE_OFFICE, TransportCommonMaster.CHARGE_TYPE_OFFICE_NAME);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("incExpTypeHM", incExpTypeHM);
			request.setAttribute("chargeTypeHM", chargeTypeHM);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}

