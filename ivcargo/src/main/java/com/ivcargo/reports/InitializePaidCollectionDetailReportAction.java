package com.ivcargo.reports;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.LrPaidStatementReportConfigDTO;

public class InitializePaidCollectionDetailReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		String			        specificChargesIds			= null;
		List<Long>		    	specificChargesId			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= ActionStaticUtil.getExecutive(request);
			final var	cacheManip 		= new CacheManip(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.PAID_COLLECTION_DETAIL, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	configuration 					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.LR_PAID_STATEMENT_DETAIL, executive.getAccountGroupId());
			final var	showDateColumn					= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_DATE_COLUMN,true);
			final var	showFromBranchColumn			= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_FROM_BRANCH_COLUMN,false);
			final var	showToBranchColumn				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_TO_BRANCH_COLUMN,false);
			final var	showChargeWeightColumn			= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_CHARGE_WEIGHT_COLUMN,false);
			final var	showStatusColumn				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_STATUS_COLUMN,true);
			final var	showBookingCharegs				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_BOOKING_CHAREGS,true);
			final var	showMrNumberColumn				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_MR_NUMBER_COLUMN,false);
			final var	setCustomPrint					= configuration.getBoolean(LrPaidStatementReportConfigDTO.SET_CUSTOM_PRINT,false);
			final var	showSpecificCharges	 	        = configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_SPECIFIC_CHARGES,false);

			final var	showCommissionAndTotalWithoutCommission	 = configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_COMMISSION_AND_TOTAL_WITHOUT_COMMISSION,true);

			if(showSpecificCharges) {
				specificChargesIds				= configuration.getString(LrPaidStatementReportConfigDTO.SPECIFIC_CHARGES_IDS);
				specificChargesId				=  CollectionUtility.getLongListFromString(specificChargesIds);
			}

			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_DATE_COLUMN, showDateColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_FROM_BRANCH_COLUMN, showFromBranchColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_TO_BRANCH_COLUMN, showToBranchColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_CHARGE_WEIGHT_COLUMN, showChargeWeightColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_STATUS_COLUMN, showStatusColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_COMMISSION_AND_TOTAL_WITHOUT_COMMISSION, showCommissionAndTotalWithoutCommission);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_BOOKING_CHAREGS, showBookingCharegs);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_CONSIGNEE_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_CONSIGNEE_COLUMN));
			request.setAttribute("showMrNumberColumn", showMrNumberColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.MAX_MONTH_SELECTION, configuration.getInt(LrPaidStatementReportConfigDTO.MAX_MONTH_SELECTION,0));
			request.setAttribute("setCustomPrint", setCustomPrint);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_SPECIFIC_CHARGES, showSpecificCharges);
			request.setAttribute("specificChargesId", specificChargesId);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_DESTINATION_BRANCH_CODE, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_DESTINATION_BRANCH_CODE));
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_TDS_AMOUNT, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_TDS_AMOUNT));
			request.setAttribute(LrPaidStatementReportConfigDTO.LESS_TDS_AMOUNT_FROM_GRAND_TOTAL, configuration.getBoolean(LrPaidStatementReportConfigDTO.LESS_TDS_AMOUNT_FROM_GRAND_TOTAL));
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_BOOKING_COMMISSION_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_BOOKING_COMMISSION_COLUMN));
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_SAID_TO_CONTAIN_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_SAID_TO_CONTAIN_COLUMN));
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_EXECUTIVE_NAME_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_EXECUTIVE_NAME_COLUMN));
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_BANK_NAME_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_BANK_NAME_COLUMN, false));

			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_BOOKING_CHARGE_COMMISSION, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_BOOKING_CHARGE_COMMISSION));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}