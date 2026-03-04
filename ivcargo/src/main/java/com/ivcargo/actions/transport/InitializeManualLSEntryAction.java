package com.ivcargo.actions.transport;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.constant.properties.ConfigParamPropertiesConstant;
import com.iv.constant.properties.dispatch.ManualLSConfigurationConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.ChargeTypeModel;

public class InitializeManualLSEntryAction implements Action {

	public static final String TRACE_ID = "InitializeManualLSEntryAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>				error 						= null;
		var		maxNoOfDaysAllowBeforeCashStmtEntry	= 0;
		final var 	MILLIS_IN_DAY = 1000 * 60 * 60 * 24L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 						= new CacheManip(request);
			final var	executive  						= cacheManip.getExecutive(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.MANUALLSENTRY))
				return;

			var			date	   						= new Date();
			final var	dateFormat 						= new SimpleDateFormat("dd-MM-yyyy");
			final var	configuration					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CONFIG_PARAM);
			final var	manualLSconfigHM				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.MANUAL_LS);
			final var	bookingChargeConfiguration		= (String) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.MANUAL_LS_BOOKING_CHARGES, "0");
			final var	bookingChargesArr 				= CollectionUtility.getLongListFromString(bookingChargeConfiguration);
			final var	setDefaultSourceBranchInLSAndLR = (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SET_DEFAULT_SOURCE_BRANCH_IN_LS_AND_LR, false);
			final var	setDefaultDestinationBranchInLSAndLR = (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SET_DEFAULT_DESTINATION_BRANCH_IN_LS_AND_LR, false);
			final var	defaultSourceBranchId			= (int) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DEFAULT_SOURCE_BRANCH_ID, 0);
			final var	defaultDestinationBranchId		= (int) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DEFAULT_DESTINATION_BRANCH_ID, 0);
			final var	defaultLRDestinationBranchId	= (int) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DEFAULT_LR_DEST_BRANCH, 0);
			final var	removeTBBWaybillType 			= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.REMOVE_TBB_WAY_BILL_TYPE, false);
			final var	displayFOCWayBillType 			= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DISPLAY_FOC_WAY_BILL_TYPE, false);

			final var	bookingChargesConfigMap			= new HashMap<Long, String>();

			request.setAttribute("isActualWeightShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_ACTUAL_WEIGHT_SHOW, false));
			request.setAttribute("isPrivateMarkaShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_PRIVATE_MARKA_SHOW, false));
			request.setAttribute("isBillingPartyShow", !removeTBBWaybillType && (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_BILLING_PARTY_SHOW, false));
			request.setAttribute("checkLrNumberAgentWise", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.CHECK_LR_NUMBER_AGENT_WISE, false));
			request.setAttribute("isCrossingHireShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_CROSSING_HIRE_SHOW, true));
			request.setAttribute("isCrossingHireEditable", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_CROSSING_HIRE_EDITABLE, false));
			request.setAttribute("isCrossingHireInfoShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_CROSSING_HIRE_INFO_SHOW, false));
			request.setAttribute("isRemarkColShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_REMARK_COL_SHOW, false));
			request.setAttribute("isInvoiceColShow", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_INVOICE_COL_SHOW, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_INVOICE_NUMBER_COLUMN, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_INVOICE_NUMBER_COLUMN, false));
			request.setAttribute("isLSNumberRequired", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_LS_NUMBER_REQUIRED, true));
			request.setAttribute("lrNumberWithLSSourceBranchCode", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.LR_NUMBER_WITH_LS_SOURCE_BRANCH_CODE, false));
			request.setAttribute(ManualLSConfigurationConstant.DISPLAY_CREDIT_WAY_BILL_TYPE_FOR_CROSSING_AGENT, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DISPLAY_CREDIT_WAY_BILL_TYPE_FOR_CROSSING_AGENT,false));
			request.setAttribute(ManualLSConfigurationConstant.DO_NOT_ALLOW_TO_BOOK_TOPAY_LR_WITH_AMOUNT, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DO_NOT_ALLOW_TO_BOOK_TOPAY_LR_WITH_AMOUNT, false));
			request.setAttribute(ManualLSConfigurationConstant.DISPLAY_FOC_WAY_BILL_TYPE, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DISPLAY_FOC_WAY_BILL_TYPE,false));
			request.setAttribute(ManualLSConfigurationConstant.REMOVE_TBB_WAY_BILL_TYPE, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.REMOVE_TBB_WAY_BILL_TYPE, true));

			final var	isDefaultManualLSEntryPage		= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_DEFAULT_MANUAL_LS_ENTRY_PAGE, false);
			final var	saidToContainAutoSave			= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SAID_TO_CONTAIN_AUTO_SAVE, true);

			request.setAttribute("saidToContainAutoSave", saidToContainAutoSave);
			request.setAttribute("isDisplayBillingPartyColumn", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_DISPLAY_BILLING_PARTY_COLUMN, true));
			request.setAttribute("isDisplaySaidToContainColumn", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_DISPLAY_SAID_TO_CONTAIN_COLUMN, true));
			request.setAttribute("showDeclaredValueColumn", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_DECLARED_VALUE_COLUMN, false));
			request.setAttribute("showSingleEwaybillColumn", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_SINGLE_EWAYBILL_COLUMN, false));
			request.setAttribute("doNotBookingForConsignorGeneralParty", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DO_NOT_BOOKING_FOR_CONSIGNOR_GENERAL_PARTY, false));
			request.setAttribute("doNotBookingForConsigneeGeneralParty", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DO_NOT_BOOKING_FOR_CONSIGNEE_GENERAL_PARTY, false));
			request.setAttribute("doNotBookingForZeroAmount", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DO_NOT_BOOKING_FOR_ZERO_AMOUNT, false));
			request.setAttribute("doNotShowOperationalBranch", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DO_NOT_SHOW_OPERATIONAL_BRANCH, false));
			request.setAttribute("remarkValidationDisableInManualLs", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.REMARK_VALIDATION_DISABLE_IN_MANUAL_LS,false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_BILL_SELECTION, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_BILL_SELECTION, false));
			request.setAttribute("showActualAndChargeWeight", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_ACTUAL_AND_CHARGE_WEIGHT,false));
			request.setAttribute("validateEwayBillNumberByApi", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.VALIDATE_EWAY_BILL_NUMBER_BY_API,false));
			request.setAttribute("allowAlphaNumericCharInLrNumber", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.ALLOW_ALPHA_NUMERIC_CHAR_IN_LRNUMBER,false));
			request.setAttribute("validateDuplicateEwaybillNumberOnLrNumber", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.VALIDATE_DUPLICATE_EWAY_BILL_NUMBER_ON_LR_NUMBER, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_TOTAL_QUANTITY, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_TOTAL_QUANTITY, false));
			request.setAttribute(ManualLSConfigurationConstant.CALCULATE_TOTAL_CHARGE, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.CALCULATE_TOTAL_CHARGE, false));
			request.setAttribute(ManualLSConfigurationConstant.SET_DEFAULT_SOURCE_BRANCH_IN_LS_AND_LR, setDefaultSourceBranchInLSAndLR);
			request.setAttribute(ManualLSConfigurationConstant.DEFAULT_SOURCE_BRANCH_ID, defaultSourceBranchId);
			request.setAttribute(ManualLSConfigurationConstant.SHOW_TOTAL_PAID_AMOUNT, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_TOTAL_PAID_AMOUNT, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_TOTAL_TBB_AMOUNT, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_TOTAL_TBB_AMOUNT, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_DELETE_BUTTON_FOR_EACH_ROW, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_DELETE_BUTTON_FOR_EACH_ROW, false));
			request.setAttribute(ManualLSConfigurationConstant.VALIDATE_TOTAL_LR_CROSSING_HIRE_WITH_LS_CROSSING_HIRE, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.VALIDATE_TOTAL_LR_CROSSING_HIRE_WITH_LS_CROSSING_HIRE, false));
			request.setAttribute(ManualLSConfigurationConstant.SET_DEFAULT_LS_DATE, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SET_DEFAULT_LS_DATE, false));

			final var	chargeTypeModelArr = cacheManip.getActiveBookingCharges(request, executive.getBranchId());

			if(ObjectUtils.isNotEmpty(bookingChargesArr) && ObjectUtils.isNotEmpty(chargeTypeModelArr)) {
				final Map<Long, String>	activeBookingChargeMap = Stream.of(chargeTypeModelArr)
						.collect(Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel::getChargeName, (e1, e2) -> e1));

				for (final Long chargeId : bookingChargesArr)
					if(activeBookingChargeMap.get(chargeId) != null)
						bookingChargesConfigMap.put(chargeId, activeBookingChargeMap.get(chargeId));
			}

			final var	bookingChargesConfigArr = new String[bookingChargesConfigMap.size()];

			if(ObjectUtils.isNotEmpty(bookingChargesConfigMap))
				bookingChargesConfigMap.values().toArray(bookingChargesConfigArr);

			final var	packingType   = cacheManip.getPackingTypeData(request, executive.getAccountGroupId());

			//Check If packingTypeForGroup are Missing
			if(ObjectUtils.isEmpty(packingType))
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=5");

			request.setAttribute("packingType", packingType);

			final var	tallyTRFAllowed						= (boolean) configuration.getOrDefault(ConfigParamPropertiesConstant.TALLY_TRANSFER_ALLOWED, false);
			final var	moduleWiseDaysConfigAllowed			= (boolean) configuration.getOrDefault(ConfigParamPropertiesConstant.ALLOW_MODULE_WISE_DAYS, false);

			if (moduleWiseDaysConfigAllowed && !tallyTRFAllowed)
				maxNoOfDaysAllowBeforeCashStmtEntry = (int) configuration.getOrDefault(ConfigParamPropertiesConstant.DAYS_FOR_MANUAL_LS, 0);
			else
				maxNoOfDaysAllowBeforeCashStmtEntry = (int) configuration.getOrDefault(ConfigParamPropertiesConstant.DEFAULT_DAYS_FOR_MANUAL_LS, 0);

			final var	currentDate  = dateFormat.format(date.getTime());

			if(maxNoOfDaysAllowBeforeCashStmtEntry > 0)
				date = new Date(date.getTime() - (maxNoOfDaysAllowBeforeCashStmtEntry - 1) * MILLIS_IN_DAY);
			else {
				date = new Date(date.getTime() - MILLIS_IN_DAY);
				maxNoOfDaysAllowBeforeCashStmtEntry = 1;
			}

			if(setDefaultSourceBranchInLSAndLR) {
				final var	branch 		= cacheManip.getGenericBranchDetailCache(request, Long.parseLong(Integer.toString(defaultSourceBranchId)));

				if(branch != null) {
					final var	subregion 	= cacheManip.getGenericSubRegionById(request, branch.getSubRegionId());

					request.setAttribute(Constant.SOURCE_BRANCH_NAME, branch.getName());
					request.setAttribute(Constant.SOURCE_SUB_REGION_NAME, subregion.getName());
					request.setAttribute(Constant.SOURCE_CITY_ID, branch.getCityId());
				}
			}

			if(setDefaultDestinationBranchInLSAndLR) {
				final var	branch 		= cacheManip.getGenericBranchDetailCache(request, Long.parseLong(Integer.toString(defaultDestinationBranchId)));

				if(branch != null) {
					final var	subregion 	= cacheManip.getGenericSubRegionById(request, branch.getSubRegionId());

					request.setAttribute(ManualLSConfigurationConstant.DEFAULT_DESTINATION_BRANCH_ID, defaultDestinationBranchId);
					request.setAttribute(Constant.DESTINATION_BRANCH_NAME, branch.getName() + " ( " + subregion.getName() + " )");
					request.setAttribute(Constant.DESTINATION_CITY_ID, branch.getCityId());
				}
			} else if(defaultLRDestinationBranchId > 0) {
				final var	branch 		= cacheManip.getGenericBranchDetailCache(request, Long.parseLong(Integer.toString(defaultLRDestinationBranchId)));

				if(branch != null) {
					request.setAttribute(ManualLSConfigurationConstant.DEFAULT_LR_DEST_BRANCH, defaultLRDestinationBranchId);
					request.setAttribute(Constant.DESTINATION_BRANCH_NAME, branch.getName());
					request.setAttribute(Constant.DESTINATION_CITY_ID, branch.getCityId());
				}
			}

			request.setAttribute("maxNoOfDaysAllowBeforeCashStmtEntry", Integer.toString(maxNoOfDaysAllowBeforeCashStmtEntry));
			request.setAttribute("previousDate", dateFormat.format(date.getTime()));
			request.setAttribute("currentDate", currentDate);
			request.setAttribute("PartyMasterDetails", CorporateAccountDao.getInstance().getPartyDetailsByExactName("JTC", executive.getAccountGroupId()));

			if(bookingChargesConfigArr != null && bookingChargesConfigArr.length > 0)
				request.setAttribute("bookingChargesConfigArr", bookingChargesConfigArr);

			//Set Auto Party Save configuration (No/Yes)
			final var autoSavePartyConfigValue = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_CONFIGURATION);

			if(autoSavePartyConfigValue == ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_NOT_ALLOWED)
				request.setAttribute("isAutoPartySave", "false");
			else if(autoSavePartyConfigValue == ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_ALLOWED)
				request.setAttribute("isAutoPartySave", "true");

			final List<WayBillType> newWayBillTypeList	= new ArrayList<>();

			final var	wayBillTypes 				= cacheManip.getWayBillTypeList(request, executive.getAccountGroupId());

			for(final Short lrType : wayBillTypes) {
				if(removeTBBWaybillType && lrType == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
						|| !displayFOCWayBillType && lrType == WayBillTypeConstant.WAYBILL_TYPE_FOC)
					continue;

				final var lrTypeName	= WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(lrType);

				if(StringUtils.isNotEmpty(lrTypeName)) {
					final var	wayBillType = new WayBillType();
					wayBillType.setWayBillTypeId(lrType);
					wayBillType.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillType.getWayBillTypeId()));
					newWayBillTypeList.add(wayBillType);
				}
			}

			request.setAttribute("newWayBillTypeList", newWayBillTypeList);

			if(isDefaultManualLSEntryPage)
				request.setAttribute("nextPageToken", "success_default");
			else if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MULTANI_SONA_TRAVELS
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_DHARIWAL
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SEC
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_PR
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NTCS
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_PSR
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_HTC
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GTC
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SHIV
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_BABAT
					)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
