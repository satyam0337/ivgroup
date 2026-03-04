package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeCityWiseCollectionReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.CITY_WISE_COLLECTION_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL,false))
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			else
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY,false))
				request.setAttribute("fromSubregionLabel", "From City");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}