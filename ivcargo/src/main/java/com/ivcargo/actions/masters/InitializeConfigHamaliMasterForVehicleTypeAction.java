package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.HamaliMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeConfigHamaliMasterForVehicleTypeAction implements Action{
	public static final String TRACE_ID = "InitializeConfigHamaliMasterForVehicleTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache 			= new CacheManip(request);
			final var executive 		= cache.getExecutive(request);

			if(executive != null) {
				request.setAttribute("vehicleTypes", cache.getVehicleTypeForGroup(request, executive.getAccountGroupId()));

				final var	hamaliMasterConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_CONFIG_HAMALI_MASTER);

				ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
				ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
				ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
				ActionStaticUtil.executiveTypeWiseActiveBranches(request, cache, executive);

				request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

				request.setAttribute("hamaliMasterConfig", hamaliMasterConfig);
				request.setAttribute("configTypeList", BookingWayBillSelectionUtility.getConfigHamaliTypeList((String) hamaliMasterConfig.getOrDefault(HamaliMasterConfigurationConstant.HAMALI_TYPE_CONFIG_VALUE_IDS, null)));
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}