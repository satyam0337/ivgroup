package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.cashstatement.CashStatementPropertiesConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;

public class InitializeCashStatementReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> error 										= null;
		AccountGroupNetworkConfiguration[] assignedAccountGroupNetwork 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip 	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);

			final var pageId  = JSPUtility.getAttrOrParam(request, Constant.PAGE_ID);
			final var eventId = JSPUtility.getAttrOrParam(request, Constant.EVENT_ID);

			final var uniqueName	= "50".equals(pageId) && "156".equals(eventId) ? BusinessFunctionConstants.ADVANCED_CASH_STATEMENT_REPORT : BusinessFunctionConstants.CASHSTATEMENTREPORT;

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, uniqueName, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	confValObj 	= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	configuration 						= cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
			final var	showGroupMergingBranchData 			= configuration.getBoolean(CashStatementConfigurationDTO.SHOW_GROUP_MERGING_BRANCH_DATA);
			final var cashStatementConfig	= cacheManip.getReportConfiguration(request, executive.getAccountGroupId(), ReportIdentifierConstant.CASH_STATEMENT_REPORT);

			request.setAttribute(CashStatementPropertiesConstant.IS_ALLOW_CUSTOM_FONT_SIZE_FOR_CASH_STATEMENT, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_ALLOW_CUSTOM_FONT_SIZE_FOR_CASH_STATEMENT, false));
			request.setAttribute(CashStatementPropertiesConstant.GENERATE_TALLY_TRANSFER_EXCEL, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.GENERATE_TALLY_TRANSFER_EXCEL, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_PAIDBHAD_AC_NAME, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_PAIDBHAD_AC_NAME, true));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_OPENING_BALANCE, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_OPENING_BALANCE, true));
			request.setAttribute("showSelectedOptionInPrint", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_SELECTED_OPTION_IN_PRINT, false));
			request.setAttribute("replaceCreditDebitLabels", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.REPLACE_CREDIT_DEBIT_LABELS, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_DELIVERY_REGISTER_REPORT_LINK_ON_DELIVERY_COLLECTION, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_DELIVERY_REGISTER_REPORT_LINK_ON_DELIVERY_COLLECTION, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_SHORT_CREDIT_PAYMENT_REGISTER_LINK_ON_SHORT_CREDIT_COLLECTION, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_SHORT_CREDIT_PAYMENT_REGISTER_LINK_ON_SHORT_CREDIT_COLLECTION,false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_DELIVERY_REGISTER_REPORT_LINK_ON_DELIVERY_COMMISSION, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_DELIVERY_REGISTER_REPORT_LINK_ON_DELIVERY_COMMISSION, false));
			request.setAttribute(CashStatementPropertiesConstant.IS_SHOW_LINK_ON_BLHPV_NO, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SHOW_LINK_ON_BLHPV_NO, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_UNLOADING_ENTRY, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_UNLOADING_ENTRY, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_LOADING_ENTRY, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_LOADING_ENTRY, false));
			request.setAttribute(CashStatementPropertiesConstant.DO_NOT_SHOW_CLOSING_BALANCE_IN_CASE_OF_MISMATCH, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.DO_NOT_SHOW_CLOSING_BALANCE_IN_CASE_OF_MISMATCH, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_AGENT_COMMISSION_REPORT_LINK_ON_BOOKING_COMMISSION, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_AGENT_COMMISSION_REPORT_LINK_ON_BOOKING_COMMISSION, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_LOADING_CHARGE_AC_NAME, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_LOADING_CHARGE_AC_NAME, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_UNLOADING_CHARGE_AC_NAME, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_UNLOADING_CHARGE_AC_NAME, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_TESTING_MODE_MESSAGE, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_TESTING_MODE_MESSAGE, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_ACTUAL_CREATION_DATE, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_ACTUAL_CREATION_DATE, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_ADDRESS_WITH_FILE_NAME, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_ADDRESS_WITH_FILE_NAME, false));
			request.setAttribute(CashStatementPropertiesConstant.IS_SHOW_LINK_FOR_LR_VIEW_ON_WAYBILL_NUMBER, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SHOW_LINK_FOR_LR_VIEW_ON_WAYBILL_NUMBER, false));
			request.setAttribute("hideDeactiveBranches", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.HIDE_DEACTIVE_BRANCHES, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_HAMALI_CHARGE_ENTRY, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_HAMALI_CHARGE_ENTRY, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_TOTAL_ONLY_ON_LAST_PRINT_PAGE, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_TOTAL_ONLY_ON_LAST_PRINT_PAGE, false));

			if (showGroupMergingBranchData)
				assignedAccountGroupNetwork = cacheManip.getAssignedAccountGroupNetwork(request, executive.getAccountGroupId());

			request.setAttribute("assignedAccountGroupNetwork", assignedAccountGroupNetwork);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}