package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.collection.CreditPaymentReportConfigurationDTO;
import com.platform.utils.PropertiesUtility;

public class InitializeCreditPaymentReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 						= null;
		Executive 					executive 					= null;
		ActionInstanceUtil 			actionUtil2 				= null;
		ValueObject					creditPaymentConfig			= null;
		var						showPanNumberColumn			= false;
		var						showTdsAmountColumn			= false;
		var 					showBillSelection			= false;
		var 					showDiscountColumn			= false;
		var 					showActualBookingDate		= false;
		var 					showLsDateColumn			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache	= new CacheManip(request);
			executive = cache.getExecutive(request);

			creditPaymentConfig	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CREDIT_PAYMENT_REPORT, executive.getAccountGroupId());

			if(creditPaymentConfig != null) {

				showPanNumberColumn		= PropertiesUtility.isAllow(creditPaymentConfig.getString(CreditPaymentReportConfigurationDTO.SHOW_PAN_NUMBER_COLUMN, "false"));
				showTdsAmountColumn		= PropertiesUtility.isAllow(creditPaymentConfig.getString(CreditPaymentReportConfigurationDTO.SHOW_TDS_AMOUNT_COLUMN, "false"));
				showBillSelection		= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.SHOW_BILL_SELECTION, false);
				showDiscountColumn		= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.SHOW_DISCOUNT_COLUMN, false);
				showActualBookingDate	= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.SHOW_ACTUAL_BOOKING_DATE, false);
				showLsDateColumn		= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.SHOW_LS_DATE_COLUMN, false);

				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_PAN_NUMBER_COLUMN, showPanNumberColumn);
				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_TDS_AMOUNT_COLUMN, showTdsAmountColumn);
				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_BILL_SELECTION, showBillSelection);
				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_DISCOUNT_COLUMN, showDiscountColumn);
				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_ACTUAL_BOOKING_DATE, showActualBookingDate);
				request.setAttribute(CreditPaymentReportConfigurationDTO.SHOW_LS_DATE_COLUMN, showLsDateColumn);
			}

			final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}