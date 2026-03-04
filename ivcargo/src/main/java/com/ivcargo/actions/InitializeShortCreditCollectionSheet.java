package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeShortCreditCollectionSheet implements Action {
	public static final String TRACE_ID = "InitializeShortCreditCollectionSheet";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>		error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);

			final var	executive 	= cache.getExecutive(request);

			if(executive != null) {
				ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

				final var	configuration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);

				final var	collectionPersonAutoCompleteByBranch	= (boolean) configuration.getOrDefault(STBSConfigurationConstant.COLLECTION_PERSON_AUTO_COMPLETE_BY_BRANCH_ID, false);
				final var	showDateRangeOptionToGetDataForBillCreation	= (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_DATE_RANGE_OPTION_TO_GET_DATA_FOR_BILL_CREATION, false);
				final var	isPartyRequired							= (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_PARTY_REQUIRED, false);

				final var	showDateOptionBySubRegionWiseArr		= CollectionUtility.getLongListFromString((String) configuration.getOrDefault(STBSConfigurationConstant.SUB_REGION_IDS_TO_SHOW_DATE_RANGE_OPTION, "0"));
				final var	isPartyRequiredBySubRegionWiseArr		= CollectionUtility.getLongListFromString((String) configuration.getOrDefault(STBSConfigurationConstant.SUB_REGION_IDS_TO_VALIDATE_VALID_PARTY, "0"));

				final var	showDateOptionBySubRegionWise = showDateRangeOptionToGetDataForBillCreation && (showDateOptionBySubRegionWiseArr.contains(executive.getSubRegionId()) || showDateOptionBySubRegionWiseArr.isEmpty());
				final var	isPartyRequiredBySubRegionWise = isPartyRequired && (isPartyRequiredBySubRegionWiseArr.contains(executive.getSubRegionId()) || isPartyRequiredBySubRegionWiseArr.isEmpty());

				if(collectionPersonAutoCompleteByBranch)
					request.setAttribute("branchId", executive.getBranchId());

				final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

				request.setAttribute("showPartyWiseSelectionOption", (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_PARTY_WISE_SELECTION_OPTION, false));
				request.setAttribute(STBSConfigurationConstant.SHOW_DATE_RANGE_OPTION_TO_GET_DATA_FOR_BILL_CREATION, showDateRangeOptionToGetDataForBillCreation);
				request.setAttribute(STBSConfigurationConstant.SHOW_SUMMARY_PRINT_BUTTON, (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_SUMMARY_PRINT_BUTTON, false));
				request.setAttribute("stbsBillNumberFormat", (boolean) configuration.getOrDefault(STBSConfigurationConstant.STBS_BILL_NUMBER_FORMAT, false));
				request.setAttribute("allowSTBSCreationWithoutCollectionPerson", (boolean) configuration.getOrDefault(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON, false));
				request.setAttribute("STBSCreationWithParty", (boolean) configuration.getOrDefault(STBSConfigurationConstant.STBS_CREATION_WITH_PARTY, false));
				request.setAttribute("showCollectionPersonWiseSelectionOption", (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_COLLECTON_PERSON_WISE_SELECTION_OPTION, false));
				request.setAttribute("isShowBothOptionInPartyWiseSelection", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_BOTH_OPTION_IN_PARTY_WISE_SELECTION, false));
				request.setAttribute("isShowBothOptionInBranchWiseSelection", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_BOTH_OPTION_IN_BRANCH_WISE_SELECTION, false));
				request.setAttribute("isShowBothOptionInLrNumberWiseSelection", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_BOTH_OPTION_IN_LR_NUMBER_WISE_SELECTION, false));
				request.setAttribute("isShowEditLrRateLink", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_EDIT_LR_RATE_LINK, false));
				request.setAttribute("isShowEditArticleLink", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_EDIT_ARTICLE_LINK, false));
				request.setAttribute("showBillSelectionTypeId", (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_BILL_SELECTION_OPTION, false));
				request.setAttribute("isPartyRequired", isPartyRequired);
				request.setAttribute("physicalBranchesOnly", true);
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
				request.setAttribute("showDateOptionBySubRegionWise", showDateOptionBySubRegionWise);
				request.setAttribute("isPartyRequiredBySubRegionWise", isPartyRequiredBySubRegionWise);
				request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));
				request.setAttribute("isShowCrNumberColumn", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_CR_NUMBER_COLUMN, false));
				request.setAttribute("isShowDeliveredToNameColumn", (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_DELIVERED_TO_NAME_COLUMN, false));
				request.setAttribute("executiveNameColumnDisplay", (boolean) configuration.getOrDefault(STBSConfigurationConstant.EXECUTIVE_NAME_COLUMN_DISPLAY, false));
				request.setAttribute("showFilterForDateAndConsignee", (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_FILTER_FOR_DATE_AND_CONSIGNEE, false));
				request.setAttribute("invoiceNumberColumnDisplay", (boolean) configuration.getOrDefault(STBSConfigurationConstant.INVOICE_NUMBER_COLUMN_DISPLAY, false));
				request.setAttribute("allowToValidateForSamePartyToCreateSTBS", (boolean) configuration.getOrDefault(STBSConfigurationConstant.ALLOW_TO_VALIDATE_FOR_SAME_PARTY_TO_CREATE_STBS, false));
				request.setAttribute(STBSConfigurationConstant.SHOW_BOOKING_DELIVERY_DATE_COLUMN_SEPARATELY, (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_BOOKING_DELIVERY_DATE_COLUMN_SEPARATELY, false));
				request.setAttribute(STBSConfigurationConstant.SHOW_STBS_BILL_SETTLEMENT_BUTTON, (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_STBS_BILL_SETTLEMENT_BUTTON, false));
				request.setAttribute(STBSConfigurationConstant.APPLY_TAX_ON_STBS, (boolean) configuration.getOrDefault(STBSConfigurationConstant.APPLY_TAX_ON_STBS, false));
				request.setAttribute(STBSConfigurationConstant.SHOW_HSN_CODE, (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_HSN_CODE, false));
				request.setAttribute("partyAutoCompleteWithNameAndGST", (boolean) configuration.getOrDefault(STBSConfigurationConstant.PARTY_AUTO_COMPLETE_WITH_NAME_AND_GST, false));

				ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

				request.setAttribute("nextPageToken", "success");
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}