package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.constant.properties.report.account.DueBillInformationCreditorWiseConfigurationConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.BillTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;

public class InitializePaymentDueBillInformationCreditorWiseReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache       = new CacheManip (request);
			final var	executive 	= cache.getExecutive(request);

			final var		configuration						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DUE_BILL_CREDITOR_WISE, executive.getAccountGroupId());
			var				showDropDownSelection				= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_DROP_DOWN_SELECTION,true);
			final var		reportWiseMinDateSelectionConfig	= cache.getReportWiseMinDateSelectionConfig(request, executive.getAccountGroupId());
			final Map<Long, ExecutiveFeildPermissionDTO>	execFldPermissions 					= cache.getExecutiveFieldPermission(request);

			final var	allowCustomMinDate			= reportWiseMinDateSelectionConfig.getBoolean(ReportWiseMinDateSelectionConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);

			if(allowCustomMinDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null)
				showDropDownSelection = false;

			final Map<Short, String>	billTypeHM	= new LinkedHashMap<>();

			billTypeHM.put(BillTypeConstant.NORMAL_BILL_TYPE_ID, BillTypeConstant.NORMAL_BILL_TYPE_NAME);
			billTypeHM.put(BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID, BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_NAME);
			billTypeHM.put(Constant.INPUT_ALL_ID, Constant.INPUT_ALL_VALUE);

			request.setAttribute("showDropDownSelection", showDropDownSelection);
			request.setAttribute("reportName", AccountGroupPermissionsBllImpl.getInstance().getDisplayNameOfExecutivePermissions(cache.getGroupPermissionHMByUniqueName(request, executive.getAccountGroupId()), BusinessFunctionConstants.DUE_BILL_CREDITOR_WISE_REPORT));
			request.setAttribute("showBalanceAmountColumn", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_BALANCE_AMOUNT_COLUMN,false));
			request.setAttribute("showBillTypeDropDownSelection", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_BILL_TYPE_DROP_DOWN_SELECTION,false));
			request.setAttribute("showBillCoveringNumber", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_BILL_COVERING_NUMBER,false));
			request.setAttribute("showBillCoveringDate", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_BILL_COVERING_DATE,false));
			request.setAttribute("showBillCoveringBranch", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_BILL_COVERING_BRANCH,false));
			request.setAttribute("showWeightColumn", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_WEIGHT_COLUMN,false));
			request.setAttribute("showArticleColumn", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_ARTICLE_COLUMN,false));
			request.setAttribute("showTaxColumn", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_TAX_COLUMN,false));
			request.setAttribute("showPrintButton", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_PRINT_BUTTON,false));
			request.setAttribute("showOnAccountDetails", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_ON_ACCOUNT_DETAILS,false));
			
			
			request.setAttribute(DueBillInformationCreditorWiseConfigurationConstant.PARTY_WISE_GROUPING_EXCEL_DATA, configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.PARTY_WISE_GROUPING_EXCEL_DATA,false));
			request.setAttribute("billTypeHM", billTypeHM);
			request.setAttribute("minDateSelection", cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.DUE_BILL_CREDITOR_WISE_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.DUE_BILL_CREDITOR_WISE_REPORT_MIN_DATE));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED,false);
			request.setAttribute("showSupplementaryBillData", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_SUPPLEMENTARY_BILL_DATA,false));
			request.setAttribute("allowTwoYearDateRange", configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.ALLOW_TWO_YEAR_DATE_RANGE,false));



			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}