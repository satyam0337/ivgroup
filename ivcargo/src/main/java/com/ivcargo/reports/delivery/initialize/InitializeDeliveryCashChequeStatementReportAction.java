package com.ivcargo.reports.delivery.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.modules.DlyCashChequeStatementReportConfigurationDTO;

public class InitializeDeliveryCashChequeStatementReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>				error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	cache		= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DELIVERY_CASH_CHEQUE_STATEMENT_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DELIVERY_CASH_CHEQUE_STATEMENT_REPORT, executive.getAccountGroupId());

			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.BILL_TYPE_SELECTION, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.BILL_TYPE_SELECTION, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_DICOUNT_AMOUNT_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_DICOUNT_AMOUNT_COLUMN, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_TDS_AMOUNT_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_TDS_AMOUNT_COLUMN, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_POP_FOR_XP_AND_7_PRINT, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_POP_FOR_XP_AND_7_PRINT, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_DISCOUNT_AND_FINAL_TOTAL_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_DISCOUNT_AND_FINAL_TOTAL_COLUMN, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.LESS_TDS_AMOUNT_IN_PAYMENT_TYPE_WISE_SUMMARY, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.LESS_TDS_AMOUNT_IN_PAYMENT_TYPE_WISE_SUMMARY, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_BOOKING_TOTAL_PAID_AMOUNT_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_BOOKING_TOTAL_PAID_AMOUNT_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_BOOKING_TOTAL_TBB_AMOUNT_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_BOOKING_TOTAL_TBB_AMOUNT_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_PAYMENT_TYPE_WISE_COLUMNS, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_PAYMENT_TYPE_WISE_COLUMNS, false));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_CR_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_CR_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_LR_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_LR_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_CHEQUE_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_NO_OF_CHEQUE_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_ART_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_ART_COLUMN, true));
			request.setAttribute(DlyCashChequeStatementReportConfigurationDTO.SHOW_WEIGHT_COLUMN, configuration.getBoolean(DlyCashChequeStatementReportConfigurationDTO.SHOW_WEIGHT_COLUMN, true));

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}