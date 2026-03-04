package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.utils.PropertiesUtility;

public class InitializeDailyBranchCollectionReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		ArrayList<PaymentTypeConstant> 		paymentTypesListForSelection				= null;
		var								calculateBookingCommission						= true;
		var								calculateDeliveryCommission						= true;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache	 		= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DAILY_BRANCH_COLLECTION_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	confValObj 						= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	isPaymentTypeNeeded 			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_PAYMENT_TYPE_NEEDED);
			final var	showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);
			final var	showGroupMergingBranchData		= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA,false);
			final var	allowTimeLocking				= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			final var	startHour						= confValObj.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			final var	endHour							= confValObj.getString(CommonReportsConfigurationDTO.END_HOUR,"0");
			final var	showLoadingAndUnloadingCharge 	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_LOADING_AND_UNLOADING_CHARGE);

			final var	showCashCollectionInReport		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			final var	showBookingCommissionColumn		= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_COMMISSION_COLUMN,"false"));
			final var	paymentTypesList				= CollectionUtility.getShortListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.PAYMENT_TYPE_LIST));

			final var	isBranchWiseBookingCommissionCalculationAllowed	 = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_BOOKING_COMMISSION_CALCULATION_ALLOWED,false);
			final var	isBranchWiseDeliveryCommissionCalculationAllowed = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_DELIVERY_COMMISSION_CALCULATION_ALLOWED,false);

			if(isBranchWiseBookingCommissionCalculationAllowed) {
				final var	bookingBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BOOKING_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(bookingBranchIdList.contains(executive.getBranchId()))
					calculateBookingCommission		= false;
			}

			if(isBranchWiseDeliveryCommissionCalculationAllowed) {
				final var	deliveryBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.DELIVERY_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(deliveryBranchIdList.contains(executive.getBranchId()))
					calculateDeliveryCommission		= false;
			}

			final var	branchWiseShowCommissionTable	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.BRANCH_WISE_SHOW_COMMISSION_TABLE, false);

			final var	showCommissionTable	= branchWiseShowCommissionTable && CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BRANCH_IDS_TO_SHOW_COMMISSION_TABLE, "0")).contains(executive.getBranchId());

			var isTargetAfterStartAndBeforeEnd = false;

			if(allowTimeLocking)
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);

			request.setAttribute("calculateBookingCommission", calculateBookingCommission);
			request.setAttribute("calculateDeliveryCommission", calculateDeliveryCommission);
			request.setAttribute("showCommissionTable", showCommissionTable);
			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, showGroupMergingBranchData);

			if(paymentTypesList != null) {
				paymentTypesListForSelection	= new ArrayList<>();

				for (final Short element : paymentTypesList) {
					final var	paymentTypeConstant		= new PaymentTypeConstant();

					paymentTypeConstant.setPaymentTypeId(element);
					paymentTypeConstant.setPaymentTypeName(PaymentTypeConstant.getPaymentType(element));

					paymentTypesListForSelection.add(paymentTypeConstant);
				}
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_PAYMENT_TYPE_OPTION_TO_SHOW, true);
			request.setAttribute("confValObj", confValObj);

			final var	subRegions = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId(), showGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", subRegions);
			request.setAttribute("TosubRegionForGroup", subRegions);
			request.setAttribute("isPaymentTypeNeeded", isPaymentTypeNeeded);
			request.setAttribute("paymentTypesListForSelection", paymentTypesListForSelection);
			request.setAttribute("showDeliveryTax", configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_TAX, false));
			request.setAttribute("showDeliveryDiscount", configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_DISCOUNT, false));

			request.setAttribute("showBookingCommissionColumn", showBookingCommissionColumn);
			request.setAttribute("showCreditDetailsColumn", showCreditDetailsColumn);
			request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT, showCashCollectionInReport);
			request.setAttribute("fromSubregionLabel", configuration.getString(DailyBranchCollectionReportConfigurationDTO.FROM_SUBREGION_LABEL, null));
			request.setAttribute("cityBranchLabel", configuration.getString(DailyBranchCollectionReportConfigurationDTO.CITY_BRANCH_LABEL, null));
			request.setAttribute("showLoadingAndUnloadingCharge", showLoadingAndUnloadingCharge);

			if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MAHESHCARGO
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SURYADEV
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ATL
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMATPT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMAT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KOMITLA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SNDP
					)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}