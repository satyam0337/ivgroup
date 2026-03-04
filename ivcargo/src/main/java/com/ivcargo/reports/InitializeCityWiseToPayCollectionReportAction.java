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
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeCityWiseToPayCollectionReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>		error 							= null;
		Executive 					executive 						= null;
		ActionInstanceUtil			actionUtil2						= null;
		SubRegion[]					allsubregionsdataforgrouparray	= null;
		ValueObject					confValObj						= null;
		CacheManip					cacheManip						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip 		= new CacheManip(request);
			executive 		= cacheManip.getExecutive(request);
			confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL, false))
				request.setAttribute("sourceRegionLabel", "Source Region");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY, false))
				request.setAttribute("fromSubregionLabel", "From City");
			else
				request.setAttribute("fromSubregionLabel", "Source SubRegion");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY, false))
				request.setAttribute("cityBranchLabel", "From Branch");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY, false))
				request.setAttribute("agencyBranchLabel", "From Branch");
			else
				request.setAttribute("agencyBranchLabel", "Source Branch");

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_DESTINATION_SUB_REGION_TO_TO_CITY, false))
				request.setAttribute("toSubRegionLabel", "To City");
			else
				request.setAttribute("toSubRegionLabel", "Destination SubRegion");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			allsubregionsdataforgrouparray = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("subRegionForGroup", allsubregionsdataforgrouparray);
			request.setAttribute("TosubRegionForGroup", allsubregionsdataforgrouparray);
			request.setAttribute("regionForGroup", cacheManip.getRegionsByGroupId(request, executive.getAccountGroupId()));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 			= null;
			executive 		= null;
			actionUtil2		= null;
			allsubregionsdataforgrouparray	= null;
		}
	}
}
