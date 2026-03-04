package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.constant.properties.report.account.BillInformationCreditorWiseConfigurationConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeBillInformationCreditorWiseReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);
			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BILL_INFORMATION_CREDITOR_WISE_REPORT, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("reportName", AccountGroupPermissionsBllImpl.getInstance().getDisplayNameOfExecutivePermissions(cacheManip.getGroupPermissionHMByUniqueName(request, executive.getAccountGroupId()), BusinessFunctionConstants.BILL_INFORMATION_CREDITOR_WISE_REPORT));
			request.setAttribute("showTaxAmountOnBill", configuration.getBoolean(BillInformationCreditorWiseConfigurationConstant.SHOW_TAX_AMOUNT_ON_BILL, false));
			request.setAttribute("showBalanceAmountColumn", configuration.getBoolean(BillInformationCreditorWiseConfigurationConstant.SHOW_BALANCE_AMOUNT_COLUMN, false));
			request.setAttribute("showNetAmountWithoutRoundOff", configuration.getBoolean(BillInformationCreditorWiseConfigurationConstant.SHOW_BALANCE_AMOUNT_COLUMN, false));

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}