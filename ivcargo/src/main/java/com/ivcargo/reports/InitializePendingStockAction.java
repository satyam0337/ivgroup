package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.PendingDeliveryStockReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializePendingStockAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);
			final var	confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			final var	groupConfig						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_DELIVERY_STOCK_REPORT, executive.getAccountGroupId());
			final var	isShowConsigneeMobile			= groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.IS_ALLOW_CONSIGNEE_MOBILE, false);
			final var	isShowGroupMergingBranchData	= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA,false);
			final var	isShowConsignorMobile			= groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.IS_ALLOW_CONSIGNOR_MOBILE, false);

			request.setAttribute("isShowConsigneeMobile", isShowConsigneeMobile);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, isShowGroupMergingBranchData);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute("fromSubregionLabel", groupConfig.getString(PendingDeliveryStockReportConfigurationConstant.FROM_SUBREGION_LABEL, ""));
			request.setAttribute("cityBranchLabel", groupConfig.getString(PendingDeliveryStockReportConfigurationConstant.CITY_BRANCH_LABEL, ""));
			request.setAttribute("toSubRegionLabel", groupConfig.getString(PendingDeliveryStockReportConfigurationConstant.TO_SUB_REGION_LABEL, ""));
			request.setAttribute("toBranchLabel", groupConfig.getString(PendingDeliveryStockReportConfigurationConstant.TO_BRANCH_LABEL, ""));
			request.setAttribute(PendingDeliveryStockReportConfigurationConstant.IS_ALLOW_CONSIGNOR_MOBILE, isShowConsignorMobile);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				request.setAttribute(PendingDeliveryStockReportConfigurationConstant.SHOW_DESTINATION_BRANCH_STATUS, groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.SHOW_DESTINATION_BRANCH_STATUS, false));
				request.setAttribute(PendingDeliveryStockReportConfigurationConstant.SHOW_DESTINATION_PARENT_BRANCH_NAME, groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.SHOW_DESTINATION_PARENT_BRANCH_NAME, false));
			}

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	subRegions	= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId(), isShowGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", subRegions);
			request.setAttribute("TosubRegionForGroup", subRegions);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}