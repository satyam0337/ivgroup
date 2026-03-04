package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.incomeexpense.IncomeExpenseHeadwiseDetailsReportConfigurationDTO;

public class InitializeIncomeExpenseHeadWiseDetailsReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.INCOME_EXPENSE_HEADWISE_DETAIL, executive.getAccountGroupId());

			final Map<Short, String>	incExpTypeHM	= new LinkedHashMap<>();
			final Map<Short, String>	chargeTypeHM	= new LinkedHashMap<>();

			incExpTypeHM.put(TransportCommonMaster.CHARGE_TYPE_INCOME, TransportCommonMaster.CHARGE_TYPE_INCOME_NAME);
			incExpTypeHM.put(TransportCommonMaster.CHARGE_TYPE_EXPENSES, TransportCommonMaster.CHARGE_TYPE_EXPENSE_NAME);

			if(configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_ALL_OPTION_IN_INC_EXP_TYPE,false))
				incExpTypeHM.put(TransportCommonMaster.CHARGE_TYPE_ALL, TransportCommonMaster.CHARGE_TYPE_ALL_NAME);

			chargeTypeHM.put(TransportCommonMaster.CHARGE_TYPE_LR, TransportCommonMaster.CHARGE_TYPE_LR_NAME);
			chargeTypeHM.put(TransportCommonMaster.CHARGE_TYPE_OFFICE, TransportCommonMaster.CHARGE_TYPE_OFFICE_NAME);

			request.setAttribute("customDateRange", configuration.getInt(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.CUSTOM_DATE_RANGE));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("incExpTypeHM", incExpTypeHM);
			request.setAttribute("chargeTypeHM", chargeTypeHM);
			request.setAttribute("showVoucherApproveStatus", configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_VOUCHER_APPROVE_STATUS,false));
			request.setAttribute("showApproveDate", configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_APPROVE_DATE,false));
			request.setAttribute("showVehicleNumber", configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_VEHICLE_NUMBER,false));
			request.setAttribute("showVehicleAgentName", configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_VEHICLE_AGENT_NAME,false));
			request.setAttribute("showPaymentType", configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.SHOW_PAYMENT_TYPE,false));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}