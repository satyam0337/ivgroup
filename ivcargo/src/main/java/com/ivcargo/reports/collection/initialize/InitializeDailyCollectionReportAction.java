/**
 *
 */
package com.ivcargo.reports.collection.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.collection.DailyCollectionReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

/**
 * @author Anant Chaudhary	03-02-2016
 *
 */
public class InitializeDailyCollectionReportAction implements Action {

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	error 			= null;
		Executive[]				execu			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DAILY_COLLECTION_BY_EXEC_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT))
				return;

			executive.getAccountGroupId();

			final var	confValObj 						= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_COLLECTION_REPORT, executive.getAccountGroupId());

			final var	showPaymentModeColumn			= configuration.getBoolean(DailyCollectionReportConfigurationDTO.SHOW_PAYMENT_MODE_COLUMN,false);
			final var	showCashCollectionInReport		= configuration.getBoolean(DailyCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			final var	allowTimeLocking				= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			final var	startHour						= confValObj.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			final var	endHour							= confValObj.getString(CommonReportsConfigurationDTO.END_HOUR,"0");

			var isTargetAfterStartAndBeforeEnd = false;

			if(allowTimeLocking)
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);

			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);

			final var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var displayActiveUser = DisplayDataConfigurationBllImpl.getInstance().displayOnlyActiveUserInReport(displayDataConfig, ReportIdentifierConstant.DAILY_COLLECTION_REPORT);

			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, true);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute(DailyCollectionReportConfigurationDTO.SHOW_PAYMENT_MODE_COLUMN, showPaymentModeColumn);
			request.setAttribute(DailyCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT, showCashCollectionInReport);
			request.setAttribute(DailyCollectionReportConfigurationDTO.TO_SUB_REGION_LABEL, configuration.getString(DailyCollectionReportConfigurationDTO.TO_SUB_REGION_LABEL));
			request.setAttribute(DailyCollectionReportConfigurationDTO.TO_BRANCH_LABEL, configuration.getString(DailyCollectionReportConfigurationDTO.TO_BRANCH_LABEL));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("TosubRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("TosubRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN){
				if(displayActiveUser)
					execu 		= ExecutiveDao.getInstance().getActiveExecutiveByBranchId(executive.getBranchId());
				else
					execu 		= ExecutiveDao.getInstance().findByBranchId(executive.getBranchId());

				request.setAttribute("execs", execu);
			}

			request.setAttribute("displayActiveUser", displayActiveUser);

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
