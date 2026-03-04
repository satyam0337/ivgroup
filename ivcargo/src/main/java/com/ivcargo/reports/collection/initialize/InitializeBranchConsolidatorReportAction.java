package com.ivcargo.reports.collection.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.collection.BranchConsolidatedReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;

/**
 * @author Anant Chaudhary	04-02-2016
 * Transfer in new Package com.ivcargo.reports.collection.initialize
 *
 */
public class InitializeBranchConsolidatorReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		var			isTargetAfterStartAndBeforeEnd = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip 		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.BRANCH_CONSOLIDATED_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var 	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BRANCH_CONSOLIDATED_REPORT, executive.getAccountGroupId());
			final var	confValObj 						= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	showChequeAmountColumn			= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_CHEQUE_AMOUNT_COLUMN,false);
			final var	showCashCollectionInReport		= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			final var	allowTimeLocking				= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			final var	allowBranchConsolidatorTimeLocking		= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_BRANCH_CONSOLIDATOR_TIME_LOCKING,false);
			final var	startHour						= confValObj.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			final var	endHour							= confValObj.getString(CommonReportsConfigurationDTO.END_HOUR,"0");

			if(allowTimeLocking || allowBranchConsolidatorTimeLocking)
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);

			request.setAttribute(BranchConsolidatedReportConfigurationDTO.SHOW_CHEQUE_AMOUNT_COLUMN, showChequeAmountColumn);
			request.setAttribute(BranchConsolidatedReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT, showCashCollectionInReport);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(BranchConsolidatedReportConfigurationDTO.FROM_SUBREGION_LABEL, configuration.getString(BranchConsolidatedReportConfigurationDTO.FROM_SUBREGION_LABEL));
			request.setAttribute(BranchConsolidatedReportConfigurationDTO.CITY_BRANCH_LABEL, configuration.getString(BranchConsolidatedReportConfigurationDTO.CITY_BRANCH_LABEL));
			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}