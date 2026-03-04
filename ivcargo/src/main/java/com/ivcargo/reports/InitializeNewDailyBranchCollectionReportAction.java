package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.utils.Utility;

public class InitializeNewDailyBranchCollectionReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 							= null;
		AccountGroupNetworkConfiguration[]	assignedAccountGroupNetwork		= null;
		ArrayList<PaymentTypeConstant> 		paymentTypesListForSelection	= null;
		var									isTargetAfterStartAndBeforeEnd	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.NEW_DAILY_BRANCH_COLLECTION_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_PAYMENT_TYPE_OPTION_TO_SHOW, true);

			var		subRegions 			= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());

			final List<SubRegion>	subRegionList	= Arrays.asList(subRegions);

			subRegionList.sort(Comparator.comparing(SubRegion::getName));

			subRegions		= new SubRegion[subRegionList.size()];
			subRegionList.toArray(subRegions);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	confValObj 						= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	showGroupMergingBranchData  	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_GROUP_MERGING_BRANCH_DATA);
			final var	isPaymentTypeNeeded 			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_PAYMENT_TYPE_NEEDED);
			final var	paymentTypes					= configuration.getString(DailyBranchCollectionReportConfigurationDTO.PAYMENT_TYPE_LIST);
			final var	allowTimeLocking				= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			final var	startHour						= confValObj.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			final var	endHour							= confValObj.getString(CommonReportsConfigurationDTO.END_HOUR,"0");
			final var   showPaymentTypeColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PAYMENT_TYPE_COLUMN);
			final var   showLRStatusColumn				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_LR_STATUS_COLUMN);

			final var	paymentTypesList				= Utility.GetShortArrayListFromString(paymentTypes, ",");

			if(paymentTypesList != null) {
				paymentTypesListForSelection	= new ArrayList<>();

				for (final Short aPaymentTypesList : paymentTypesList) {
					final var	paymentTypeConstant		= new PaymentTypeConstant();

					paymentTypeConstant.setPaymentTypeId(aPaymentTypesList);
					paymentTypeConstant.setPaymentTypeName(PaymentTypeConstant.getPaymentType(aPaymentTypesList));

					paymentTypesListForSelection.add(paymentTypeConstant);
				}
			}

			if(showGroupMergingBranchData)
				assignedAccountGroupNetwork 	= cacheManip.getAssignedAccountGroupNetwork(request, executive.getAccountGroupId());

			if(allowTimeLocking)
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);

			request.setAttribute("subRegionForGroup", subRegions);
			request.setAttribute("assignedAccountGroupNetwork", assignedAccountGroupNetwork);
			request.setAttribute("isPaymentTypeNeeded", isPaymentTypeNeeded);
			request.setAttribute("paymentTypesListForSelection", paymentTypesListForSelection);
			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);
			request.setAttribute("showPaymentTypeColumn", showPaymentTypeColumn);
			request.setAttribute("showLRStatusColumn", showLRStatusColumn);

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_PCPL)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}