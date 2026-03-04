package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.VehicleTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.modules.VehicleWiseDispatchReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeVehicleWiseDispatchReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 			= new CacheManip(request);
			final var	executive 			= cacheManip.getExecutive(request);
			final HashMap<?, ?>	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	confValObj 						= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	valueObjvechilewisReport		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.VEHICLE_WISE_DISPATCH_REPORT, executive.getAccountGroupId());

			final var	isShowGroupMergingBranchData	= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, false);
			final var	showBranchSelection				= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.SHOW_BRANCH_SELECTION, false);
			final var	isShowVehicleTypeSelection		= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_VEHICLE_TYPE_SELECTION, false);
			final var	vehicleTypeIds					= valueObjvechilewisReport.getString(VehicleWiseDispatchReportConfigurationDTO.VEHICLE_TYPE_IDS, null);

			if(isShowVehicleTypeSelection)
				request.setAttribute("vehicleTypetList", VehicleTypeConstant.getVehicleTypeList(vehicleTypeIds));

			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.GENERATE_VEHICLE_AGENT_WISE_EXCEL) != null)
				request.setAttribute("generateVehicleAgentWiseExcel", true);

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.SHOW_BRANCH_SELECTION, showBranchSelection);
			request.setAttribute("fromSubregionLabel", valueObjvechilewisReport.getString(VehicleWiseDispatchReportConfigurationDTO.FROM_SUBREGION_LABEL, ""));
			request.setAttribute("toSubRegionLabel", valueObjvechilewisReport.getString(VehicleWiseDispatchReportConfigurationDTO.TO_SUB_REGION_LABEL, ""));
			request.setAttribute("toBranchLabel", valueObjvechilewisReport.getString(VehicleWiseDispatchReportConfigurationDTO.TO_BRANCH_LABEL, ""));
			request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_VEHICLE_TYPE_SELECTION, isShowVehicleTypeSelection);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.ALL_OPTION_REQUIRED_IN_FROM_SUBREGION, false));
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.ALL_OPTION_REQUIRED_IN_TO_BRANCH, false));
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, isShowGroupMergingBranchData);

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	allSubregions	= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId(), isShowGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", allSubregions);
			request.setAttribute("TosubRegionForGroup", allSubregions);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("vehicleAgentDetails", false);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}