
package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.EncryptDecryptUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

public class InitialiseTransportEditWayBillAction implements Action {
	public static final String TRACE_ID = "InitialiseTransportEditWayBillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 									= null;
		List<String> 					remarkTemplateList						= null;

		try {
			final var	cacheManip 					= new CacheManip(request);

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var executive = cacheManip.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			/**
			 * Initialize the variables
			 */
			final var	configuration				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	confValObj 					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
			final var	generalConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);

			/**
			 * getting the property value and setting it to string
			 */
			configuration.put(GeneralConfiguration.BRANCH_WISE_DATA_HIDE, generalConfiguration.getOrDefault(GeneralConfiguration.BRANCH_WISE_DATA_HIDE, false));
			configuration.put(GeneralConfiguration.BRANCH_IDS_TO_HIDE, generalConfiguration.get(GeneralConfiguration.BRANCH_IDS_TO_HIDE));
			configuration.put(GeneralConfiguration.BOOKING_CHARGE_IDS, generalConfiguration.get(GeneralConfiguration.BOOKING_CHARGE_IDS));

			final var	standardLrRemarkAllowed		= (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesDTO.STANDARD_LR_REMARK_ALLOWED, false);

			if(standardLrRemarkAllowed)
				remarkTemplateList 	= CollectionUtility.getStringListFromString((String) confValObj.getOrDefault(GroupConfigurationPropertiesDTO.REMARK_TEMPLATES, ""), "_");

			final var	execFldPermissionsHM = cacheManip.getExecutiveFieldPermission(request);

			final var isAllowInsuranceService	= execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_BOOKING_TIME_INSURANCE_SERVICE) != null || (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesConstant.ALLOW_BRANCH_WISE_INSURANCE_SERVICE, false)
					&& com.iv.utils.utility.Utility.isIdExistInLongList(confValObj, GroupConfigurationPropertiesConstant.BRANCHES_TO_ALLOW_INSURANCE_SERVICE, executive.getBranchId());

			/**
			 * set Attribute and getting them in jsp file
			 */
			request.setAttribute("isShowToken", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_TOKEN, Constant.FALSE));
			request.setAttribute("isShowConsignorConsigneeCopy", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONSIGNOR_CONSIGNEE_COPY, Constant.FALSE));
			request.setAttribute("isShowConsignorletterduelysigned", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONSIGNOR_LETTER, Constant.FALSE));
			request.setAttribute("isShowStatisticalCharge", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_STATISTICAL_CHARGE, Constant.FALSE));
			request.setAttribute("displayDocumentReceivedFeild", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_DOCUMENT_RECEIVED_FEILD, false));
			request.setAttribute("showIntransitStatusForDispatchedLR", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_INTRANSIT_STATUS_FOR_DISPATCHED_LR,false));
			request.setAttribute("showBillApprovedByColumn", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BILL_APPROVED_BY_COLUMN,false));
			request.setAttribute("CentralizedCancellation", (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesDTO.CENTRALIZED_CANCELLATION, false));
			request.setAttribute("showWeightRate", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_WEIGHT_RATE,false));
			request.setAttribute("displayRatesOfArticleAndWeight", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_RATES_OF_ARTICLE_AND_WEIGHT,false));
			request.setAttribute("showNextPrevButtonOnView", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_NEXT_PREV_BUTTON_ON_VIEW, false));
			request.setAttribute("showCancelledImageInLrViwe", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CANCELLED_IMAGE_IN_LR_VIWE,false));
			request.setAttribute("defaultSizeCrNumberLabel", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.DEFAULT_SIZE_CR_NUMBER_LABEL, Constant.FALSE));
			request.setAttribute("customSizeCrNumberLabel", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.CUSTOM_SIZE_CR_NUMBER_LABEL, Constant.FALSE));
			request.setAttribute("showLsDetailsButton", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LS_DETAILS_BUTTON, false));
			request.setAttribute("showPrivateMarkAsTripId", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_PRIVATE_MARK_AS_TRIP_ID, false));
			request.setAttribute("remarkTemplateList", remarkTemplateList);
			request.setAttribute(LrViewConfigurationPropertiesConstant.IS_SHOW_CANCELLATION_AMOUNT_IN_TOTAL, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_SHOW_CANCELLATION_AMOUNT_IN_TOTAL, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.GOODS_CLASSIFICATION_SELECTION, (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesConstant.GOODS_CLASSIFICATION_SELECTION, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_CHARGES, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_CHARGES, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_COLLECTION_PERSON_COLUMN, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_COLLECTION_PERSON_COLUMN, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_EXECUTIVE_DETAIL, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_EXECUTIVE_DETAIL,false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_COMMISSION_LABEL_WITH_VALUE, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_COMMISSION_LABEL_WITH_VALUE,false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_PAYMENT_MODE, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_PAYMENT_MODE,false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_HIRE_AMOUNT_BOOKING_AND_DELIVERY_LR_VIEW, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_HIRE_AMOUNT_BOOKING_AND_DELIVERY_LR_VIEW,false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_CR_NUMBER_LABEL_IN_BOLD, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CR_NUMBER_LABEL_IN_BOLD,false));
			request.setAttribute(GroupConfigurationPropertiesConstant.ALLOW_TO_ADD_MULTIPLE_INVOICE_DETAIL, (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesConstant.ALLOW_TO_ADD_MULTIPLE_INVOICE_DETAIL, false) || isAllowInsuranceService);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_TDS_COLUMN_BEFORE_GRAND_TOTAL_AND_LESS_FROM_GRAND_TOTAL, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_TDS_COLUMN_BEFORE_GRAND_TOTAL_AND_LESS_FROM_GRAND_TOTAL,false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_EXECUTIVE_SELECTION_FOR_CENTRALIZED_CANCEL_CR, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_EXECUTIVE_SELECTION_FOR_CENTRALIZED_CANCEL_CR, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_APPROVAL_TYPE, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_APPROVAL_TYPE, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_BKG_DLY_INVOICE_PRINT_BUTTON, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BKG_DLY_INVOICE_PRINT_BUTTON, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.ADDITIONAL_REMARK_FEILD_LEBEL, confValObj.getOrDefault(GroupConfigurationPropertiesConstant.ADDITIONAL_REMARK_FEILD_LEBEL, "Additional Remark"));
			request.setAttribute(GroupConfigurationPropertiesConstant.TOTAL_AMOUNT_LABEL, confValObj.getOrDefault(GroupConfigurationPropertiesConstant.TOTAL_AMOUNT_LABEL, "Total"));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_SOURCE_BRANCH_MOB_NO, configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_SOURCE_BRANCH_MOB_NO, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.PACKAGE_CONDITION_SELECTION, (boolean) confValObj.getOrDefault(GroupConfigurationPropertiesConstant.PACKAGE_CONDITION_SELECTION, false));

			final var enwayBillId	= JSPUtility.GetString(request, "enwayBillId", null);

			request.setAttribute("wayBillId", enwayBillId != null ? EncryptDecryptUtility.decryptLong(enwayBillId) : JSPUtility.GetLong(request, "wayBillId", 0));

			if(request.getParameter("id") != null)
				request.setAttribute("OpenPopUp", "true" );

			if(request.getParameter("doNotPrint") != null && Boolean.parseBoolean(request.getParameter("doNotPrint")))
				request.setAttribute("doNotPrint", "true" );

			request.setAttribute("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));
			request.setAttribute(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, configuration);

			final var transportViewWayBillAction = new TransportViewWayBillAction();
			transportViewWayBillAction.execute(request, response);

			if(request.getParameter("flag") != null)
				request.setAttribute("flag", Boolean.parseBoolean(request.getParameter("flag")));

			if(request.getParameter("showEditDeliveryPaymentLink") != null)
				request.setAttribute("showEditDeliveryPaymentLink", Boolean.parseBoolean(request.getParameter("showEditDeliveryPaymentLink")));

			request.setAttribute(Executive.EXECUTIVE, executive);
			request.setAttribute(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

			if(request.getAttribute("wayBillModel") == null) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			} else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}