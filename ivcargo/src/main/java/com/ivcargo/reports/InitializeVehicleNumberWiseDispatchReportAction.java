package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.VehicleNumberWiseDispatchReportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.constant.FeildPermissionsConstant;
public class InitializeVehicleNumberWiseDispatchReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 						error 									= null;

		try {
			error 		= ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip					= new CacheManip(request);
			final var	executive 					= cacheManip.getExecutive(request);
			final var	execFldPermissionsHM 		= cacheManip.getExecutiveFieldPermission(request);

			final var	vehicleWiseConfiguration				= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.VEHICLE_NUMBER_WISE_DISPATCH_REPORT, executive.getAccountGroupId());
			final var	isVehicleAgentWiseDownloadToExcelProp	= (boolean) vehicleWiseConfiguration.getOrDefault(VehicleNumberWiseDispatchReportConfigurationConstant.IS_VEHICLE_AGENT_WISE_DOWNLOAD_TO_EXCEL, false);

			final var	isVehicleAgentWiseDownloadToExcel 	= execFldPermissionsHM.containsKey(FeildPermissionsConstant.VEHICLE_AGENT_WISE_SEARCH_IN_VEHICLE_NUMBER_WISE_DISPATCH_REPORT) && execFldPermissionsHM.get(FeildPermissionsConstant.VEHICLE_AGENT_WISE_SEARCH_IN_VEHICLE_NUMBER_WISE_DISPATCH_REPORT) != null && isVehicleAgentWiseDownloadToExcelProp;

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("nextPageToken", "success");
			request.setAttribute("vehicleAgentDetails", false);
			request.setAttribute(VehicleNumberWiseDispatchReportConfigurationConstant.IS_VEHICLE_AGENT_WISE_DOWNLOAD_TO_EXCEL,isVehicleAgentWiseDownloadToExcel);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
