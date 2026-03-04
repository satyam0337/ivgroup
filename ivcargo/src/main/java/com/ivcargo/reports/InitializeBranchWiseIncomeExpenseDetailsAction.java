package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.BranchWiseIncomeExpenseDeatilsConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.ExecutiveDao;

public class InitializeBranchWiseIncomeExpenseDetailsAction implements Action {

	public static final String TRACE_ID = "InitializeBranchWiseIncomeExpenseDetailsAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	branchWiseIncomeExpenseReportDetailsProperties = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_INC_EXP_DETAILS, executive.getAccountGroupId());
			final var	showActiveUsersOnly	= (boolean) branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_ACTIVE_USERS_ONLY, false);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_ALL_OPTION_IN_REGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_ALL_OPTION_IN_SUB_REGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_ALL_OPTION_IN_BRANCH_REGION, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_APPROVE_DATE, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_APPROVE_DATE, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CHARGE_TYPE_LR_AND_OFFICE, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CHARGE_TYPE_LR_AND_OFFICE, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.DO_NOT_SHOW_AUTO_CREATED_VOUCHER_DATA, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.DO_NOT_SHOW_AUTO_CREATED_VOUCHER_DATA, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CONSINEE_NAME, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CONSINEE_NAME, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CONSINOR_NAME, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CONSINOR_NAME, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_LR_HYPERLINK, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_LR_HYPERLINK, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_SOURCE_BRANCH_NAME, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_SOURCE_BRANCH_NAME, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_DESTINATION_BRANCH_NAME, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_DESTINATION_BRANCH_NAME, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_STATUS_COLUMN, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_STATUS_COLUMN, false));
			request.setAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_BLHPV_DETAILS, branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.SHOW_BLHPV_DETAILS, false));


			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			request.setAttribute("showExecutiveNameSelection", true);
			request.setAttribute(ActionStaticUtil.IS_ALL_EXECUTIVE_NEED_TO_SHOW, true);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			if(executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				if(showActiveUsersOnly)
					request.setAttribute("execs", ExecutiveDao.getInstance().getActiveExecutiveByBranchId(executive.getBranchId()));
				else
					request.setAttribute("execs", ExecutiveDao.getInstance().findByBranchId(executive.getBranchId()));
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}