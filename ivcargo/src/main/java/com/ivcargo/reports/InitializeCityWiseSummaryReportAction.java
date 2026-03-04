package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeCityWiseSummaryReportAction implements Action {

	public static final String TRACE_ID = "InitializeCityWiseSummaryReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 						= null;
		ActionInstanceUtil 			actionUtil2 				= null;
		Executive   				executive					= null;
		ValueObject					confValObj					= null;
		CacheManip					cacheManip					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip 		= new CacheManip(request);
			executive 		= cacheManip.getExecutive(request);

			confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW,true);

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL,false));

			request.setAttribute("confValObj", confValObj);
			request.setAttribute("cityBranchLabel", "From Branch");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY,false))
				request.setAttribute("fromSubregionLabel", "From City");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			request.setAttribute("regionForGroup", cacheManip.getRegionsByGroupId(request, executive.getAccountGroupId()));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 		= null;
			actionUtil2 = null;
			executive	= null;
		}
	}
}