package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.LRCreditConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.CreditWayBillTxnClearance;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.utils.Converter;
import com.platform.utils.TokenGenerator;

public class InitializeCreditPaymentModuleAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache					= new CacheManip(request);
			final var	executive				= cache.getExecutive(request);

			final var	lrCreditConfigConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);

			final var	tdsConfiguration		= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			final var	generalConfiguration	= cache.getGeneralConfiguration(request, executive.getAccountGroupId());

			final var	isSearchBySingleCR								= (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_SEARCH_BY_SINGLE_CR, false);
			final var	showBillSelectionTypeId 						= (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BILL_SELECTION_TYPE_ID,false);
			request.setAttribute(LRCreditConfigurationConstant.IS_SEARCH_BY_SINGLE_CR, isSearchBySingleCR);
			request.setAttribute(LRCreditConfigurationConstant.IS_ALLOW_CLAIM_ENTRY, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_ALLOW_CLAIM_ENTRY,false));

			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var	allowBackDateEntryForCreditPayment	= execFldPermissions.get(FeildPermissionsConstant.ALLOW_BACK_DATE_ENTRY_FOR_SHORT_CREDIT_PAYMENT) != null;

			final var	noOfDays = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			if(allowBackDateEntryForCreditPayment) {
				final var previousDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

				request.setAttribute("previousDate", previousDate);
				request.setAttribute("noOfDays", noOfDays);
			}

			final var	receiveOtherBranchPaymentInLrCredit	= execFldPermissions.get(FeildPermissionsConstant.RECEIVE_OTHER_BRANCH_PAYMENT_IN_LR_CREDIT) != null;

			final var	tokenWiseCheckingForDuplicateTransaction	= (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			ActionStaticUtil.executiveTypeWiseSelection3(request, cache, executive);

			final var		paymentTypeVO	= new ValueObject();
			paymentTypeVO.put("executiveId", executive.getExecutiveId());
			paymentTypeVO.put("accountGroupId", executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			final var	paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			request.setAttribute("paymentTypeArr", paymentTypeArr);

			final Map<Short, String>	typeOfSelectionHM	= new LinkedHashMap<>();

			typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_ALL, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_ALL_NAME);
			typeOfSelectionHM.put(CreditWayBillTxnClearance.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR, CreditWayBillTxnClearance.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR_NAME);
			typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_TYPE_WISE, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_TYPE_WISE_NAME);

			if(execFldPermissions.get(FeildPermissionsConstant.LR_CREDIT_PAYMENT_SEARCH_BY_COLLECTION_PERSON) != null)
				typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_COLLECTION_PERSON, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_COLLECTION_PERSON_NAME);

			typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_SINGLE_LR, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_SINGLE_LR_NAME);
			typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_PARTY_WISE, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_PARTY_WISE_NAME);

			if(isSearchBySingleCR)
				typeOfSelectionHM.put(CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_SINGLE_CR, CreditWayBillTxnClearance.CREDIT_PAYMENT_TYPE_SINGLE_CR_NAME);

			final var	discountTypes = DiscountMasterDAO.getInstance().getDiscountTypes();

			final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			request.setAttribute("discountTypes", discountTypes);
			request.setAttribute(AliasNameConstants.IS_BACK_DATE_ENTRY_ALLOW, allowBackDateEntryForCreditPayment);
			request.setAttribute(TDSPropertiesConstant.IS_TDS_ALLOW, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_ALLOW, false));
			request.setAttribute(TDSPropertiesConstant.IS_PAN_NUMBER_REQUIRED, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_PAN_NUMBER_REQUIRED, false));
			request.setAttribute(TDSPropertiesConstant.IS_TAN_NUMBER_REQUIRED, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TAN_NUMBER_REQUIRED, false));
			request.setAttribute(TDSPropertiesConstant.IS_CHECKBOX_OPTION_TO_ALLOW_TDS, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_CHECKBOX_OPTION_TO_ALLOW_TDS, false));
			request.setAttribute(LRCreditConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY, true));
			request.setAttribute(LRCreditConfigurationConstant.IS_RECEIVED_AMT_VALIDATION_ALLOW, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_RECEIVED_AMT_VALIDATION_ALLOW, false));
			request.setAttribute(LRCreditConfigurationConstant.CHECK_PARTY_MASTER_ID, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.CHECK_PARTY_MASTER_ID, false));
			request.setAttribute(LRCreditConfigurationConstant.IS_VIEW_COLUMN_DISPLAY, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_VIEW_COLUMN_DISPLAY, false));
			request.setAttribute(LRCreditConfigurationConstant.IS_CR_NO_COLUMN_DISPLAY, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_CR_NO_COLUMN_DISPLAY, false));
			request.setAttribute(LRCreditConfigurationConstant.LR_CREDIT_CONFIGURATION, lrCreditConfigConfiguration);
			request.setAttribute(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false));
			request.setAttribute(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, false));
			request.setAttribute("receiveOtherBranchPaymentInLrCredit", receiveOtherBranchPaymentInLrCredit);
			request.setAttribute("allOptionInBranch", (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_BRANCH, false));
			request.setAttribute("showBillSelectionTypeId", showBillSelectionTypeId);
			request.setAttribute(LRCreditConfigurationConstant.SHOW_SOURCE_BRANCH_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_SOURCE_BRANCH_COLUMN_IN_PRINT, true));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DESTINATION_BRANCH_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DESTINATION_BRANCH_COLUMN_IN_PRINT, true));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BOOKING_DATE_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BOOKING_DATE_COLUMN_IN_PRINT, true));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_RECIEVED_AMOUNT_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_RECIEVED_AMOUNT_COLUMN_IN_PRINT, true));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BALANCE_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BALANCE_COLUMN_IN_PRINT, true));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DIFFERENT_HEADER_IN_PRINT_FOR_BATCO, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DIFFERENT_HEADER_IN_PRINT_FOR_BATCO, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DELIVERY_CHARGES_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DELIVERY_CHARGES_COLUMN_IN_PRINT, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BOOKING_TOTAL_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BOOKING_TOTAL_COLUMN_IN_PRINT, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_CR_NUMBER_SEARCH_IN_MULTIPLE_CLEAR, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_CR_NUMBER_SEARCH_IN_MULTIPLE_CLEAR, false));
			request.setAttribute(LRCreditConfigurationConstant.ALLOW_PARTIAL_PAYMENT_IN_MULTIPLECLEAR, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.ALLOW_PARTIAL_PAYMENT_IN_MULTIPLECLEAR, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DELIVERY_REMARK_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DELIVERY_REMARK_COLUMN_IN_PRINT, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_LINK_ON_LR_NUMBER, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_LINK_ON_LR_NUMBER, false));
			request.setAttribute(TDSPropertiesConstant.ALLOW_TO_CALCULATE_TDS_ON_MANUAL_PERCENTAGE, tdsConfiguration.getOrDefault(TDSPropertiesConstant.ALLOW_TO_CALCULATE_TDS_ON_MANUAL_PERCENTAGE, false));
			request.setAttribute(LRCreditConfigurationConstant.CLEAR_PARTY_WISE_MULTIPLE_PAYMENT_IN_SINGLE_PAYMENT_MODE, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.CLEAR_PARTY_WISE_MULTIPLE_PAYMENT_IN_SINGLE_PAYMENT_MODE, false));
			request.setAttribute(LRCreditConfigurationConstant.VALIDATE_LR_CREDIT_PAYMENT_ON_BRANCH, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.VALIDATE_LR_CREDIT_PAYMENT_ON_BRANCH, false));
			request.setAttribute(TDSPropertiesConstant.CALCULATE_TDS_ON_TOTAL, tdsConfiguration.getOrDefault(TDSPropertiesConstant.CALCULATE_TDS_ON_TOTAL, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_CENTRALIZE_DISCOUNT_TYPE,(boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_CENTRALIZE_DISCOUNT_TYPE, false));
			request.setAttribute(LRCreditConfigurationConstant.SETTLE_ONLY_SELECTED_LRS,(boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SETTLE_ONLY_SELECTED_LRS, false));

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_BRANCH, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_REGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_SUB_REGION, false));
			request.setAttribute("typeOfSelectionHM", typeOfSelectionHM);
			request.setAttribute(LRCreditConfigurationConstant.IS_SHOW_FROM_DATE_TO_DATE, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.IS_SHOW_FROM_DATE_TO_DATE, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BOOKING_DATE, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BOOKING_DATE, false));
			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_PARTY_WISE_OPTION_IN_MULTIPLE_CLEAR, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_PARTY_WISE_OPTION_IN_MULTIPLE_CLEAR, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BRANCH_WISE_OPTION_IN_MULTIPLE_CLEAR, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BRANCH_WISE_OPTION_IN_MULTIPLE_CLEAR, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_INVOICE_NUMBER, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_INVOICE_NUMBER, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DELIVERED_TO_NAME_COLUMN, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DELIVERED_TO_NAME_COLUMN, false));
			request.setAttribute(LRCreditConfigurationConstant.HIDE_WEIGHT_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.HIDE_WEIGHT_COLUMN_IN_PRINT, false));
			request.setAttribute(LRCreditConfigurationConstant.HIDE_CONSIGNOR_COLUMN_IN_PRINT, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.HIDE_CONSIGNOR_COLUMN_IN_PRINT, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_DISPATCH_DATE_COLUMN, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_DISPATCH_DATE_COLUMN, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_BOOKING_AND_DELIVERY_DATE_IN_SEPARATE_COLUMN, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_BOOKING_AND_DELIVERY_DATE_IN_SEPARATE_COLUMN, false));
			request.setAttribute(TDSPropertiesConstant.ALLOW_TO_ENTER_TDS_AMOUNT_IN_DECIMAL, (boolean) tdsConfiguration.getOrDefault(TDSPropertiesConstant.ALLOW_TO_ENTER_TDS_AMOUNT_IN_DECIMAL, false));
			request.setAttribute(LRCreditConfigurationConstant.SHOW_STATEMENT_NUMBER, (boolean) lrCreditConfigConfiguration.getOrDefault(LRCreditConfigurationConstant.SHOW_STATEMENT_NUMBER, false));

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");

			if(tokenWiseCheckingForDuplicateTransaction) {
				final var token = TokenGenerator.nextToken();
				request.setAttribute(TokenGenerator.SHORT_CREDIT_PAYMENT_TOKEN_KEY, token);
				request.getSession().setAttribute(TokenGenerator.SHORT_CREDIT_PAYMENT_TOKEN_KEY, token);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}