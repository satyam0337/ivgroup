package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BookingSummaryDestinationWiseReportPropertiesConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.model.reports.collection.BookingSummaryDestinationWiseReportModel;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeBookingSummaryDestinationWiseReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip = new CacheManip(request);
			final var	executive  = cacheManip.getExecutive(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_DESTINATION_WISE_REPORT, executive.getAccountGroupId());
			final var	isAllRegionNeedToShow			= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ALL_REGION_NEED_TO_SHOW,false);
			final var	showChargeWeightColumn			= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CHRAGE_WEIGHT_COLUMN,false);
			final var	isAssignedLocationsNeedToShow 	= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false);
			final var	showToSubRegionAndToBranch	  	= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TO_SUBREGION_AND_TO_BRANCH, false);
			final var	showBothIncomingAndOutgoing	  	= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOTH_INCOMING_AND_OUTGOING, false);
			final var	showToPayFreightColumn			= configuration.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TO_PAY_FREIGHT_COLUMN,false);
			
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, isAllRegionNeedToShow);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			final Map<Long, String>	incomingOutgoingHM	= new HashMap<>();
			final Map<Long, String>	selectTypeHM		= new HashMap<>();

			incomingOutgoingHM.put(BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_INCOMING, BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_INCOMING_NAME);
			incomingOutgoingHM.put(BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_OUTGOING, BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_OUTGOING_NAME);

			if(showBothIncomingAndOutgoing)
				incomingOutgoingHM.put(BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_BOTH, BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_BOTH_NAME);

			selectTypeHM.put(BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_DETAIL_ID, BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_DETAIL_NAME);
			selectTypeHM.put(BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_SUMMARY_ID, BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_DETAIL_SUMMARY);

			request.setAttribute("showChargeWeightColumn", showChargeWeightColumn);
			request.setAttribute("isAssignedLocationsNeedToShow", isAssignedLocationsNeedToShow);
			request.setAttribute("showToSubRegionAndToBranch", showToSubRegionAndToBranch);
			request.setAttribute("incomingOutgoingHM", incomingOutgoingHM);
			request.setAttribute("selectTypeHM", selectTypeHM);
			request.setAttribute("showToPayFreightColumn", showToPayFreightColumn);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var destsubRegionForGroup = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("destsubRegionForGroup", destsubRegionForGroup);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}