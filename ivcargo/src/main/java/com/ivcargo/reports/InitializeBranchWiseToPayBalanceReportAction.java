package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeBranchWiseToPayBalanceReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive				executive	= null;
		ActionInstanceUtil 		actionUtil2	= null;
		ValueObject				confValObj	= null;
		CacheManip				cacheManip	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip 		= new CacheManip(request);
			executive 		= cacheManip.getExecutive(request);

			confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDCITY_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_DESTINATION_SUB_REGION_TO_TO_CITY,false))
				request.setAttribute("toSubRegionLabel", "To City");
			else
				request.setAttribute("toSubRegionLabel", "Destination SubRegion");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("TosubRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 		= null;
			executive	= null;
			actionUtil2 = null;
		}
	}
}