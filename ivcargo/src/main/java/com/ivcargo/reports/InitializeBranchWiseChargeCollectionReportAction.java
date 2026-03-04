package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BranchWiseChargeCollectionReportConfigurationConstant;
import com.iv.dto.WayBillType;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.model.reports.collection.BranchWiseChargeCollectionReportModel;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeBranchWiseChargeCollectionReportAction implements Action{

	@SuppressWarnings("unused")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	caManip 	= new CacheManip(request);
			final var	executive 	= ActionStaticUtil.getExecutive(request);
			final var	execSubRegionId	= executive.getSubRegionId();

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, caManip, request, BusinessFunctionConstants.BRANCH_WISE_CHARGE_COLLECTION_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_CHARGE_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	subRegionForGroup  = caManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());

			final Map<Short, String>	incomingOutgoingHM		= new HashMap<>();
			incomingOutgoingHM.put(BranchWiseChargeCollectionReportModel.INCOMING_ID, BranchWiseChargeCollectionReportModel.INCOMING_STRING);
			incomingOutgoingHM.put(BranchWiseChargeCollectionReportModel.OUTGOING_ID, BranchWiseChargeCollectionReportModel.OUTGOING_STRING);
			incomingOutgoingHM.put(BranchWiseChargeCollectionReportModel.BOTH_ID, BranchWiseChargeCollectionReportModel.BOTH_STRING);

			final var	wayBillTypeList	= WayBillTypeConstant.getWayBillTypeRateList();

			final var	wayBillType	= new WayBillType();

			wayBillType.setWayBillTypeId(Constant.INPUT_ALL_ID);
			wayBillType.setWayBillType(Constant.INPUT_ALL_VALUE);
			wayBillTypeList.add(wayBillType);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW,false);
			request.setAttribute("fromSubregionLabel", "Source SubRegion");
			request.setAttribute("cityBranchLabel",  "Source Branch");
			request.setAttribute("toSubRegionLabel",  "Destination SubRegion");
			request.setAttribute("toBranchLabel", " Destination Branch");
			request.setAttribute("configuration", configuration);
			request.setAttribute("bookingCharges", caManip.getBookingCharges(request, executive.getBranchId()));
			request.setAttribute("deliveryCharges", caManip.getDeliveryCharges(request, executive.getBranchId()));
			request.setAttribute("incomingOutgoingHM", incomingOutgoingHM);
			request.setAttribute("wayBillTypeList", wayBillTypeList);
			request.setAttribute(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_LR_COUNT, configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_LR_COUNT, false));
			request.setAttribute(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_BRANCH_SELECTION_PANEL, configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_BRANCH_SELECTION_PANEL, false));
			request.setAttribute(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_SELECTION_FOR_INCOMING_OUTGOING, configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_SELECTION_FOR_INCOMING_OUTGOING, false));
			request.setAttribute(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_LR_TYPE_SELECTION, configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_LR_TYPE_SELECTION, false));
			request.setAttribute("subRegionForGroup", subRegionForGroup);
			request.setAttribute("TosubRegionForGroup", subRegionForGroup);
			request.setAttribute("branches", caManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), execSubRegionId));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}