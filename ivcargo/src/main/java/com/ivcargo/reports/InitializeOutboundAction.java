package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.DispatchedStockReportConfigurationConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;

public class InitializeOutboundAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 					error 							= null;
		var										isLimitedSearchForDestCities	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 							= new CacheManip(request);
			final var	executive 						= cache.getExecutive(request);

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.OUT_BOUND_MANIFEST_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	execFldPermissions 				= cache.getExecutiveFieldPermission(request);
			final var	confValObj 						= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	configuration  		       		= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.DISPATCHED_STOCK_REPORT, executive.getAccountGroupId());

			final var	isShowGroupMergingBranchData	= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, false);

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, isShowGroupMergingBranchData);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute("sortByDeliveryToId", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.SORT_BY_DELIVERY_TO_ID, false));
			request.setAttribute("fromSubregionLabel", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.FROM_SUBREGION_LABEL, ""));
			request.setAttribute("cityBranchLabel", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.CITY_BRANCH_LABEL, ""));
			request.setAttribute("toSubRegionLabel", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.TO_SUB_REGION_LABEL, ""));
			request.setAttribute("showOnlyLoginBranchData", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.SHOW_ONLY_LOGIN_BRANCH_DATA, false));
			request.setAttribute("subRegionIdToShowData", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.SUB_REGION_ID_TO_SHOW_DATA, 0));
			request.setAttribute("isInvoiceBasedStockPrint", execFldPermissions.get(FeildPermissionsConstant.INVOICE_BASED_STOCK_PRINT) != null);

			final var	subRegions 	= cache.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("subRegionForGroup", subRegions);

			if(isShowGroupMergingBranchData)
				request.setAttribute("TosubRegionForGroup", cache.getSubRegionsFromAccountGroupNetworkConfig(request, executive.getAccountGroupId()));
			else if(execFldPermissions.get(FeildPermissionsConstant.LIMITED_SEARCH_DISPATCH_STOCK_REPORT) == null)
				request.setAttribute("TosubRegionForGroup", subRegions);
			else
				isLimitedSearchForDestCities	= true;

			request.setAttribute("isLimitedSearchForDestCities", isLimitedSearchForDestCities);
			request.setAttribute("showUserLevelSelection", configuration.getOrDefault(DispatchedStockReportConfigurationConstant.SHOW_USER_LEVEL_SELECTION, false));
			request.setAttribute("admin", true);
			request.setAttribute(ActionStaticUtil.NOTODATE, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}