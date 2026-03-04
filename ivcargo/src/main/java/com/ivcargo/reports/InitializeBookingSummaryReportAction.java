package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.collection.BookingSummaryReportConfigurationDTO;

public class InitializeBookingSummaryReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		ValueObject				configObject = null;
		var isDefaultRegionAllSelection 	= false;
		var isDefaultSubRegionAllSelection  = false;
		var isDefaultBranchAllSelection 	= false;
		var	showToBranchOption				= false;
		var isAssignedLocationsNeedToShow	= false;
		var	showFromSubRegionOption			= false;
		var	showFromRegionOption			= false;
		var	hideTypeOfDataOnAllRegion		= false;
		 var showCheckBoxForTBBPartySelection = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive = ActionStaticUtil.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			configObject				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_REPORT, executive.getAccountGroupId());
			isDefaultRegionAllSelection = configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_REGION_ALL_SELCTION, false);
			isDefaultSubRegionAllSelection = configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_SUBREGION_ALL_SELCTION, false);
			isDefaultBranchAllSelection = configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_BRANCH_ALL_SELCTION, false);
			showToBranchOption			= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_TO_BRANCH_OPTION, false);
			isAssignedLocationsNeedToShow = configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false);
			showFromSubRegionOption			= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_FROM_SUB_REGION_OPTION,false);
			showFromRegionOption			= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_FROM_REGION_OPTION,false);
			hideTypeOfDataOnAllRegion		= configObject.getBoolean(BookingSummaryReportConfigurationDTO.HIDE_TYPE_OF_DATA_ON_ALL_REGION,false);
			showCheckBoxForTBBPartySelection = configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_CHECKBOX_FOR_TBB_PARTY_SELECTION, false);

			final Map<Short, String> dataTypeList = new HashMap<>();

			dataTypeList.put(TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID, TransportCommonMaster.DATA_TYPE_BRANCH_WISE_NAME);
			dataTypeList.put(TransportCommonMaster.DATA_TYPE_DATE_WISE_ID, TransportCommonMaster.DATA_TYPE_DATE_WISE_NAME);
			dataTypeList.put(TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID, TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_NAME);
			dataTypeList.put(TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID, TransportCommonMaster.DATA_TYPE_CLIENT_WISE_NAME);
			dataTypeList.put(TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID, TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_NAME);
			dataTypeList.put(TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_ID, TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_NAME);

			if(showToBranchOption)
				dataTypeList.put(TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_ID, TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_NAME);

			if(showFromSubRegionOption)
				dataTypeList.put(TransportCommonMaster.DATA_TYPE_FROM_SUBREGION_WISE_ID, TransportCommonMaster.DATA_TYPE_FROM_SUBREGION_WISE_NAME);

			if(showFromRegionOption)
				dataTypeList.put(TransportCommonMaster.DATA_TYPE_FROM_REGION_WISE_ID, TransportCommonMaster.DATA_TYPE_FROM_REGION_WISE_NAME);

			request.setAttribute("isDefaultRegionAllSelection",    isDefaultRegionAllSelection);
			request.setAttribute("isDefaultSubRegionAllSelection", isDefaultSubRegionAllSelection);
			request.setAttribute("isDefaultBranchAllSelection", isDefaultBranchAllSelection);
			request.setAttribute(BookingSummaryReportConfigurationDTO.SHOW_TO_BRANCH_OPTION, showToBranchOption);
			request.setAttribute("isAssignedLocationsNeedToShow", isAssignedLocationsNeedToShow);
			request.setAttribute(BookingSummaryReportConfigurationDTO.SHOW_FROM_SUB_REGION_OPTION, showFromSubRegionOption);
			request.setAttribute(BookingSummaryReportConfigurationDTO.SHOW_FROM_REGION_OPTION, showFromRegionOption);
			request.setAttribute(BookingSummaryReportConfigurationDTO.HIDE_TYPE_OF_DATA_ON_ALL_REGION, hideTypeOfDataOnAllRegion);
			request.setAttribute("dataTypeList", dataTypeList);
			request.setAttribute("showCheckBoxForTBBPartySelection", showCheckBoxForTBBPartySelection);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

		}  catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}