package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeReceiveDataClearAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 			= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final var	transportList	= cache.getTransportList(request);

			final var generalConfig				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE_STOCK_CLEAR);
			final var allowCentralizedReceive 	= (boolean) generalConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.ALLOW_CENTRALIZED_RECEIVE, false);

			final var	isTransport = transportList.contains(executive.getAccountGroupId());

			if(isTransport) {
				request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, true);
				request.setAttribute("grupSubRegionArr", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			} else {
				request.setAttribute(ActionStaticUtil.IS_ALL_CITY_NEED_TO_SHOW, true);
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
				request.setAttribute(ActionStaticUtil.IS_ALL_ENDCITY_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, false);
				request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
				request.setAttribute("cityList", cache.getCityListWithName(request, executive));
			}

			request.setAttribute("destinationBranch", "Destination");
			request.setAttribute("toBranchLabel", "Destination Branch");

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("isTransport", isTransport);
			request.setAttribute("displayActiveUser", true);
			request.setAttribute("allowCentralizedReceive", allowCentralizedReceive);
			request.setAttribute("showExecutiveNameSelection", allowCentralizedReceive);
			request.setAttribute(ActionStaticUtil.IS_ALL_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}