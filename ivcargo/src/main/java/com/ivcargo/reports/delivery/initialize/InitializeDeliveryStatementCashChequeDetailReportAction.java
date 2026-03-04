package com.ivcargo.reports.delivery.initialize;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.master.DivisionMaster;
import com.iv.properties.constant.report.DlyStmtCashChequeDetailsReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.utils.PropertiesUtility;

public class InitializeDeliveryStatementCashChequeDetailReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>				error 										= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);
			final var	cache		= new CacheManip(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DELIVERY_STATEMENT_CASH_CHEQUE_DETAIL_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT))
				return;

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var displayActiveUser = DisplayDataConfigurationBllImpl.getInstance().displayOnlyActiveUserInReport(displayDataConfig, ReportIdentifierConstant.DELIVERY_STATEMENT_CASH_CHEQUE_DETAIL_REPORT);
			final var originalList		= cache.getDivisionMasterList(request, executive.getAccountGroupId());

			final var divisionArrList = new ArrayList<>(originalList);

			final var allDivision = new DivisionMaster();
			allDivision.setDivisionMasterId(0L);
			allDivision.setName("ALL");
			divisionArrList.add(0, allDivision);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	configuration					   = ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DELIVERY_STATEMENT_CASH_CHEQUE_DETAIL_REPORT, executive.getAccountGroupId());
			final var 	showMrNumberInCrNumberColumn 	   = PropertiesUtility.isAllow(configuration.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MR_NUMBER_IN_CR_NUMBER_COLUMN, "false"));
			final var	showDeliveryClaimColumn			   = PropertiesUtility.isAllow(configuration.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CLAIM_COLUMN, "false"));
			final var	showCrNoPartyNameColumnInPrint     = PropertiesUtility.isAllow(configuration.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CR_NO_PARTY_NAME_COLUMN_IN_PRINT, "false"));
			final var	showExecuteNameColumnInPrint       = PropertiesUtility.isAllow(configuration.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_EXECUTE_NAME_COLUMN_IN_PRINT, "false"));
			final var	showDeliveryAtColumn			   = PropertiesUtility.isAllow(configuration.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERYAT_COLUMN, "false"));
			final Map<Short, String>	deliveryPaymentTypeHM	= new LinkedHashMap<>();

			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID, PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID, PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID, PaymentTypeConstant.PAYMENT_TYPE_CREDIT_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID, PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID, PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID, PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID, PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID, PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID, PaymentTypeConstant.PAYMENT_TYPE_PAYTM_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID, PaymentTypeConstant.PAYMENT_TYPE_IMPS_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_UPI_ID, PaymentTypeConstant.PAYMENT_TYPE_UPI_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID, PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID, PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_NAME);
			deliveryPaymentTypeHM.put(PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID, PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_NAME);

			final Map<Long, String>	lrTypeHM	= new LinkedHashMap<>();

			lrTypeHM.put(WayBillTypeConstant.WAYBILL_TYPE_PAID, WayBillTypeConstant.WAYBILL_TYPE_NAME_PAID);
			lrTypeHM.put(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY, WayBillTypeConstant.WAYBILL_TYPE_NAME_TOPAY);
			lrTypeHM.put(WayBillTypeConstant.WAYBILL_TYPE_FOC, WayBillTypeConstant.WAYBILL_TYPE_NAME_FOC);
			lrTypeHM.put(WayBillTypeConstant.WAYBILL_TYPE_CREDIT, WayBillTypeConstant.WAYBILL_TYPE_NAME_CREDITOR);

			final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			request.setAttribute("billTypeSelection", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.BILL_TYPE_SELECTION, false));
			request.setAttribute("lrTypeSelection", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_LR_TYPE_SELECTION, false));
			request.setAttribute("showDeliveryTypeSelection", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_TYPE_SELECTION, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_TDS_AMOUNT_COLUMN, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_TDS_AMOUNT_COLUMN, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SEPERATE_COLUMN_FOR_CR_NO_AND_PARTY_NAME, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SEPERATE_COLUMN_FOR_CR_NO_AND_PARTY_NAME, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_STANDARD_DATE_FORMAT, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_STANDARD_DATE_FORMAT, false));
			request.setAttribute("showBookingFreightColumn", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_FREIGHT_COLUMN, false));
			request.setAttribute("showOtherChargeColumn", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_OTHER_CHARGE_COLUMN, false));
			request.setAttribute("showExecutiveNameSelection", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_EXECUTIVE_NAME_SELECTION, false));
			request.setAttribute("sortByCRNumber", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SORT_BY_CR_NUMBER, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_COLUMN_WITH_ZERO_AMOUNT, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_COLUMN_WITH_ZERO_AMOUNT, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_POP_FOR_XP_AND_7_PRINT ,configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_POP_FOR_XP_AND_7_PRINT, false));
			request.setAttribute("showServiceTaxColumn", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SERVICE_TAX_COLUMN, true));
			request.setAttribute("showLimitedDeliveryCharges", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_LIMITED_DELIVERY_CHARGES, false));
			request.setAttribute("displayActiveUser", displayActiveUser);
			request.setAttribute("showBillSelection", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BILL_SELECTION, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MR_NUMBER_IN_CR_NUMBER_COLUMN, showMrNumberInCrNumberColumn);
			request.setAttribute("deliveryPaymentTypeHM", deliveryPaymentTypeHM);
			request.setAttribute("lrTypeHM", lrTypeHM);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CREDIT_PAYMENT_STATUS_COLUMN, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CREDIT_PAYMENT_STATUS_COLUMN, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CLAIM_COLUMN, showDeliveryClaimColumn);
			request.setAttribute("showDoorDeliveryColumn", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DOOR_DELIVERY_COLUMN, false));
			request.setAttribute("showBookingCartageColumn", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_CARTAGE_COLUMN, false));
			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CR_NO_PARTY_NAME_COLUMN_IN_PRINT, showCrNoPartyNameColumnInPrint);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_EXECUTE_NAME_COLUMN_IN_PRINT, showExecuteNameColumnInPrint);
			request.setAttribute("removeSpecificColumnFromPrintForPsr", configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.REMOVE_SPECIFIC_COLUMN_FROM_PRINT_FOR_PSR, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_PARTY_NAME_COLUMN, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_PARTY_NAME_COLUMN, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERYAT_COLUMN, showDeliveryAtColumn);
			request.setAttribute(DivisionMaster.DIVISION_LIST, divisionArrList);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DIVISION_SELECTION, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DIVISION_SELECTION, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.DEDUCT_TDS_FROM_GRAND_TOTAL, configuration.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.DEDUCT_TDS_FROM_GRAND_TOTAL, false));

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}