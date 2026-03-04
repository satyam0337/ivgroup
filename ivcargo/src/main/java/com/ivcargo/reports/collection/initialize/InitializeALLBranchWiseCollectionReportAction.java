package com.ivcargo.reports.collection.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.AllBranchWiseCollectionReportConfigurationConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Region;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;


public class InitializeALLBranchWiseCollectionReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 	error 						= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive = ActionStaticUtil.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.ALL_BRANCH_WISE_COLLECTION_NEW, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			var	regions 						= cache.getRegionsByGroupId(request, executive.getAccountGroupId());
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.ALL_BRANCH_WISE_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	showRegionSelection				= configuration.getBoolean(AllBranchWiseCollectionReportConfigurationConstant.SHOW_REGION_SELECTION);
			final var	showSubRegionAndBranchSelection	= configuration.getBoolean(AllBranchWiseCollectionReportConfigurationConstant.SHOW_SUBREGION_AND_BRANCH_SELECTION);
			final var	showDefaultAllOptnInSelectionField	= configuration.getBoolean(AllBranchWiseCollectionReportConfigurationConstant.SHOW_DEFAULT_ALL_OPTN_IN_SELECTION_FIELD,false);
			final var	commonConfig						= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	allowTimeLocking					= commonConfig.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			final var	startHour							= commonConfig.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			final var	endHour								= commonConfig.getString(CommonReportsConfigurationDTO.END_HOUR,"0");
			final var	serverIdentifiersForTimeLocking		= commonConfig.getString(CommonReportsConfigurationDTO.SERVER_IDENTIFIER_FOR_TIME_LOCKING,"");
			final var	hyperLinkToOpenNewDailyBranchWiseCollectionReport= configuration.getBoolean(AllBranchWiseCollectionReportConfigurationConstant.HYPER_LINK_TO_OPEN_NEW_DAILY_BRANCH_WISE_COLLECTION_REPORT,false);
			final var	serverIdentifiersListForTimeLocking	= CollectionUtility.getShortListFromString(serverIdentifiersForTimeLocking);
			
			final var	regionArrNew					= new Region[regions.length + 1];
			
			for(var i = 0; i < regions.length; i++)
				regionArrNew[i]	= regions[i];

			final var	region		= new Region();

			region.setName(Constant.INPUT_ALL_VALUE);
			region.setRegionId(Constant.INPUT_ALL_ID);

			regionArrNew[regionArrNew.length - 1]	= region;

			regions		= regionArrNew;

			request.setAttribute("regions", regions);
			request.setAttribute(AllBranchWiseCollectionReportConfigurationConstant.SHOW_REGION_SELECTION, showRegionSelection);
			request.setAttribute(AllBranchWiseCollectionReportConfigurationConstant.SHOW_SUBREGION_AND_BRANCH_SELECTION, showSubRegionAndBranchSelection);
			request.setAttribute(AllBranchWiseCollectionReportConfigurationConstant.SHOW_DEFAULT_ALL_OPTN_IN_SELECTION_FIELD, showDefaultAllOptnInSelectionField);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(AllBranchWiseCollectionReportConfigurationConstant.HYPER_LINK_TO_OPEN_NEW_DAILY_BRANCH_WISE_COLLECTION_REPORT, hyperLinkToOpenNewDailyBranchWiseCollectionReport);
			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			var isTargetAfterStartAndBeforeEnd = false;

			if(allowTimeLocking && serverIdentifiersListForTimeLocking.contains(executive.getServerIdentifier()))
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);

			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}